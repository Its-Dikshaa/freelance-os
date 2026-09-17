import bcrypt from 'bcryptjs';
import User from '../models/User';
import Project from '../models/Project';
import Client from '../models/Client';
import Task from '../models/Task';
import Invoice from '../models/Invoice';
import Payment from '../models/Payment';

export const runInitialMigration = async () => {
  try {
    const dikshaEmail = 'diksha@design.io';
    let dikshaUser = await User.findOne({ email: dikshaEmail });

    if (!dikshaUser) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      dikshaUser = new User({
        name: 'Diksha Jangra',
        role: 'UI/UX Designer',
        email: dikshaEmail,
        password: hashedPassword,
        studio: 'Diksha Design Studio',
        hourlyRate: 1500,
        currency: '₹',
        gst: 'GSTIN07AAAAA0000A1Z5',
        paymentNotes: 'diksha@upi',
        hasCompletedOnboarding: true
      });
      await dikshaUser.save();
      console.log(`[Migration] Primary user account created: ${dikshaEmail}`);
    }

    const dikshaId = dikshaUser._id.toString();

    // Migrate any existing unassigned database records to Diksha's account
    const pResult = await Project.updateMany({ userId: { $exists: false } }, { $set: { userId: dikshaId } });
    const cResult = await Client.updateMany({ userId: { $exists: false } }, { $set: { userId: dikshaId } });
    const tResult = await Task.updateMany({ userId: { $exists: false } }, { $set: { userId: dikshaId } });
    const iResult = await Invoice.updateMany({ userId: { $exists: false } }, { $set: { userId: dikshaId } });
    const payResult = await Payment.updateMany({ userId: { $exists: false } }, { $set: { userId: dikshaId } });

    if (pResult.modifiedCount || cResult.modifiedCount || tResult.modifiedCount || iResult.modifiedCount || payResult.modifiedCount) {
      console.log(`[Migration] Existing legacy database records migrated to user ${dikshaEmail}`);
    }
  } catch (err) {
    console.error('[Migration Error]', err);
  }
};
