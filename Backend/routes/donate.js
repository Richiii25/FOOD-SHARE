import express from 'express';

const router = express.Router();

/**
 * POST /api/donate-food
 * Receives food donation details and stores them
 */
router.post('/donate-food', async (req, res) => {
  try {
    const {
      foodName,
      description,
      quantity,
      unit,
      category,
      expiryDate,
      pickupAddress,
      pickupStartTime,
      pickupEndTime,
      dietaryInfo,
    } = req.body;

    // Validation
    if (!foodName || !quantity || !expiryDate || !pickupAddress || !pickupStartTime || !pickupEndTime) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    // Parse dietary info if it's a string
    let dietaryArray = [];
    if (typeof dietaryInfo === 'string') {
      try {
        dietaryArray = JSON.parse(dietaryInfo);
      } catch (e) {
        dietaryArray = [];
      }
    } else if (Array.isArray(dietaryInfo)) {
      dietaryArray = dietaryInfo;
    }

    // Prepare donation data
    const donationData = {
      foodName,
      description: description || '',
      quantity: parseFloat(quantity),
      unit,
      category,
      expiryDate,
      pickupAddress,
      pickupStartTime,
      pickupEndTime,
      dietaryInfo: dietaryArray,
      status: 'available',
      createdAt: new Date(),
      // In production, add user ID here
      // userId: req.user.id,
    };

    console.log('Food donation received:', donationData);

    // In production, save to database:
    // const donation = new Donation(donationData);
    // await donation.save();

    // If photo was uploaded, handle it here:
    // if (req.file) {
    //   donationData.photo = {
    //     filename: req.file.filename,
    //     path: req.file.path,
    //   };
    // }

    res.json({
      success: true,
      message: 'Food donation posted successfully',
      donation: donationData,
    });
  } catch (error) {
    console.error('Error in donate-food route:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to post food donation',
      error: error.message,
    });
  }
});

/**
 * GET /api/donate-food
 * Retrieves all available food donations
 */
router.get('/donate-food', async (req, res) => {
  try {
    // In production, fetch from database
    // const donations = await Donation.find({ status: 'available' });

    const mockDonations = [
      {
        id: 1,
        foodName: 'Fresh Tomatoes',
        quantity: 5,
        unit: 'kg',
        category: 'vegetables',
        expiryDate: '2026-04-26',
        pickupAddress: '123 Main St, City',
        pickupStartTime: '14:00',
        pickupEndTime: '16:00',
        dietaryInfo: ['vegan', 'glutenFree'],
        status: 'available',
        createdAt: '2026-04-25',
      },
    ];

    res.json({
      success: true,
      donations: mockDonations,
    });
  } catch (error) {
    console.error('Error fetching donations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch donations',
    });
  }
});

/**
 * POST /api/claim-food
 * User claims a food donation
 */
router.post('/claim-food', async (req, res) => {
  try {
    const { foodId, claimantName, contactPhone, notes } = req.body;

    // Validation
    if (!foodId || !claimantName || !contactPhone) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    // Prepare claim data
    const claimData = {
      foodId,
      claimantName,
      contactPhone,
      notes: notes || '',
      status: 'pending',
      claimedAt: new Date(),
      // In production, add userId here
      // userId: req.user.id,
    };

    console.log('Food claim received:', claimData);

    // In production:
    // 1. Check if food is still available
    // 2. Update food status to 'claimed'
    // 3. Save claim to database
    // 4. Send notification to donor

    res.json({
      success: true,
      message: 'Food claimed successfully',
      claim: claimData,
    });
  } catch (error) {
    console.error('Error in claim-food route:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to claim food',
      error: error.message,
    });
  }
});

export default router;
