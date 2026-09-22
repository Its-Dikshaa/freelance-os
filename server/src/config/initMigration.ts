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
        biz: 'Diksha Design Studio',
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

    // Earlier versions stored these fields under backend-only names, which the
    // frontend never read. `.collection` bypasses Mongoose strict mode, which
    // would otherwise drop $rename ops for fields no longer in the schema.
    const renames = await Promise.all([
      User.collection.updateMany({ studio: { $exists: true } }, { $rename: { studio: 'biz' } }),
      Project.collection.updateMany({ description: { $exists: true } }, { $rename: { description: 'desc' } }),
      Task.collection.updateMany({ dueDate: { $exists: true } }, { $rename: { dueDate: 'due' } }),
      Invoice.collection.updateMany({ issueDate: { $exists: true } }, { $rename: { issueDate: 'date' } }),
      Invoice.collection.updateMany({ dueDate: { $exists: true } }, { $rename: { dueDate: 'due' } }),
      Client.collection.updateMany({ company: { $exists: true } }, { $rename: { company: 'industry' } }),
      Client.collection.updateMany({ totalBilled: { $exists: true } }, { $rename: { totalBilled: 'value' } }),
      Client.collection.updateMany({ projectsCount: { $exists: true } }, { $rename: { projectsCount: 'projects' } }),
      Client.collection.updateMany({ avatar: { $exists: true } }, { $rename: { avatar: 'initials' } })
    ]);

    // Status values predating the enum alignment would no longer match any
    // column/filter in the UI, making those records effectively invisible.
    const statusFixes = await Promise.all([
      Task.collection.updateMany({ status: 'todo' }, { $set: { status: 'Todo' } }),
      Task.collection.updateMany({ status: 'in-progress' }, { $set: { status: 'InProgress' } }),
      Task.collection.updateMany({ status: 'in-review' }, { $set: { status: 'Review' } }),
      Task.collection.updateMany({ status: 'done' }, { $set: { status: 'Done' } }),
      Invoice.collection.updateMany({ status: 'Pending' }, { $set: { status: 'Unpaid' } }),
      Project.collection.updateMany({ status: 'In Review' }, { $set: { status: 'Review' } })
    ]);

    const normalised = [...renames, ...statusFixes].reduce((n, r) => n + r.modifiedCount, 0);
    if (normalised) {
      console.log(`[Migration] Normalised ${normalised} legacy record(s) to current field/status names`);
    }
  } catch (err) {
    console.error('[Migration Error]', err);
  }
};
