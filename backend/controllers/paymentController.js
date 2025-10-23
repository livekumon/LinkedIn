const paypal = require('@paypal/checkout-server-sdk');
const { client } = require('../config/paypal');
const Payment = require('../models/Payment');
const Plan = require('../models/Plan');
const User = require('../models/User');
const CreditTransaction = require('../models/CreditTransaction');
const { successResponse, errorResponse, notFoundResponse } = require('../utils/responseHelper');

// Create PayPal order
exports.createOrder = async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.user._id;

    // Get plan details
    const plan = await Plan.findOne({ 
      _id: planId, 
      tenantId: req.user.tenantId,
      softDelete: false,
      isActive: true 
    });

    if (!plan) {
      return notFoundResponse(res, 'Plan not found');
    }

    if (!plan.price || plan.price === 0) {
      return errorResponse(res, 'This plan does not support direct payment', 400);
    }

    // Create PayPal order
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        description: `${plan.displayName} - ${plan.aiArticleCredits} AI Article Credits`,
        amount: {
          currency_code: plan.currency || 'USD',
          value: plan.price.toFixed(2)
        },
        reference_id: planId.toString()
      }],
      application_context: {
        brand_name: 'LinkedIn Content Creator',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        return_url: `${process.env.FRONTEND_URL}/subscriptions?success=true`,
        cancel_url: `${process.env.FRONTEND_URL}/subscriptions?cancelled=true`
      }
    });

    const order = await client().execute(request);

    // Save payment record
    const payment = await Payment.create({
      userId,
      planId,
      paypalOrderId: order.result.id,
      amount: plan.price,
      currency: plan.currency || 'USD',
      status: 'created',
      aiCreditsGranted: plan.aiArticleCredits,
      paypalResponse: order.result,
      tenantId: req.user.tenantId,
      createdBy: userId,
      updatedBy: userId
    });

    return successResponse(res, { 
      orderId: order.result.id,
      paymentId: payment._id 
    }, 'Order created successfully', 201);
  } catch (error) {
    console.error('Create order error:', error);
    return errorResponse(res, error.message || 'Failed to create order', 500);
  }
};

// Capture PayPal payment
exports.captureOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.user._id;

    // Find payment record
    const payment = await Payment.findOne({ 
      paypalOrderId: orderId,
      userId,
      tenantId: req.user.tenantId
    }).populate('planId');

    if (!payment) {
      return notFoundResponse(res, 'Payment not found');
    }

    if (payment.status === 'completed') {
      return errorResponse(res, 'Payment already completed', 400);
    }

    // Capture the order
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    const capture = await client().execute(request);

    // CRITICAL: Check if PayPal payment was ACTUALLY successful
    if (capture.result.status === 'COMPLETED') {
      console.log('✅ PayPal payment confirmed as COMPLETED');
      
      // Use MongoDB session for atomic transaction
      const session = await payment.db.startSession();
      session.startTransaction();

      try {
        // Update payment record
        payment.status = 'completed';
        payment.paypalPaymentId = capture.result.purchase_units[0].payments.captures[0].id;
        payment.paypalResponse = capture.result;
        payment.completedAt = new Date();
        payment.payerEmail = capture.result.payer.email_address;
        payment.payerName = capture.result.payer.name.given_name + ' ' + capture.result.payer.name.surname;
        payment.updatedBy = userId;
        await payment.save({ session });

        // Update user credits - ONLY if PayPal confirmed payment
        const user = await User.findById(userId).session(session);
        const previousCredits = user.aiCreditsRemaining;
        
        user.aiCreditsRemaining += payment.aiCreditsGranted;
        user.aiCreditsTotal += payment.aiCreditsGranted;
        user.currentPlan = payment.planId;
        
        // Add to plan history
        user.planHistory.push({
          plan: payment.planId,
          startDate: new Date(),
          paymentId: payment._id,
          creditsGranted: payment.aiCreditsGranted
        });
        
        user.updatedBy = userId;
        await user.save({ session });

        // Create credit transaction record for audit trail
        await CreditTransaction.create([{
          userId,
          transactionType: 'add',
          creditsChanged: payment.aiCreditsGranted,
          creditsBeforeTransaction: previousCredits,
          creditsAfterTransaction: user.aiCreditsRemaining,
          reason: 'plan_purchase',
          planId: payment.planId._id,
          notes: `Purchased ${payment.planId.displayName} plan via PayPal. Order: ${orderId}`,
          metadata: {
            paymentId: payment._id,
            planId: payment.planId._id,
            planName: payment.planId.displayName,
            paypalOrderId: orderId,
            paypalPaymentId: payment.paypalPaymentId,
            amount: payment.amount,
            currency: payment.currency,
            payerEmail: payment.payerEmail
          },
          tenantId: req.user.tenantId,
          createdBy: userId,
          updatedBy: userId
        }], { session });

        // Commit transaction - all or nothing
        await session.commitTransaction();
        console.log(`✅ Credits added: ${payment.aiCreditsGranted} credits granted to user ${userId}`);

        return successResponse(res, { 
          payment: {
            id: payment._id,
            status: payment.status,
            creditsGranted: payment.aiCreditsGranted
          },
          user: {
            aiCreditsRemaining: user.aiCreditsRemaining,
            aiCreditsTotal: user.aiCreditsTotal
          }
        }, 'Payment completed successfully');
      } catch (error) {
        // Rollback if anything fails
        await session.abortTransaction();
        console.error('❌ Transaction failed, rolling back:', error);
        throw error;
      } finally {
        session.endSession();
      }
    } else {
      // Payment NOT completed by PayPal - DO NOT add credits
      console.log(`❌ PayPal payment NOT completed. Status: ${capture.result.status}`);
      payment.status = 'failed';
      payment.paypalResponse = capture.result;
      payment.updatedBy = userId;
      await payment.save();

      return errorResponse(res, `Payment not completed. Status: ${capture.result.status}`, 400);
    }
  } catch (error) {
    console.error('Capture order error:', error);
    return errorResponse(res, error.message || 'Failed to capture payment', 500);
  }
};

// Get user's payment history
exports.getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({
      userId: req.user._id,
      tenantId: req.user.tenantId,
      softDelete: false
    })
      .populate('planId', 'name displayName')
      .sort({ createdAt: -1 })
      .limit(50);

    return successResponse(res, { 
      payments, 
      count: payments.length 
    }, 'Payment history retrieved successfully');
  } catch (error) {
    console.error('Get payment history error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// Get payment details
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findOne({
      _id: req.params.id,
      userId: req.user._id,
      tenantId: req.user.tenantId,
      softDelete: false
    }).populate('planId');

    if (!payment) {
      return notFoundResponse(res, 'Payment not found');
    }

    return successResponse(res, { payment }, 'Payment retrieved successfully');
  } catch (error) {
    console.error('Get payment error:', error);
    return errorResponse(res, error.message, 500);
  }
};

