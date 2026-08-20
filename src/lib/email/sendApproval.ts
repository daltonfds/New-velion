import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendApprovalEmail(email: string, fullName: string, tempPassword: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Velion <no-reply@veliongroup.online>',
      to: [email],
      subject: 'Welcome to Velion – Your account has been approved',
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h2 style="color: #1a1a1a; font-size: 24px; font-weight: 600; margin: 0;">Welcome to Velion</h2>
            <p style="color: #6b7280; margin-top: 4px;">Your account has been approved.</p>
          </div>
          <div style="background: white; border-radius: 8px; padding: 20px; border: 1px solid #e5e7eb;">
            <p style="color: #374151; margin: 0 0 12px;">Hello <strong>${fullName}</strong>,</p>
            <p style="color: #4b5563; margin: 0 0 16px;">Your Velion account has been created. You can now log in using the temporary password below.</p>
            <div style="background: #f3f4f6; border: 1px dashed #6b7280; border-radius: 8px; padding: 16px; text-align: center; margin: 16px 0;">
              <p style="font-size: 20px; font-weight: 600; color: #1a1a1a; letter-spacing: 2px; margin: 0;">${tempPassword}</p>
            </div>
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 12px;">You will be prompted to change this password on your first login.</p>
          </div>
          <div style="text-align: center; margin-top: 16px;">
            <a href="https://veliongroup.online/login" style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; border-radius: 9999px; text-decoration: none; font-weight: 500; font-size: 14px;">
              Sign In
            </a>
          </div>
          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 24px;">© 2026 Velion. All rights reserved.</p>
        </div>
      `,
    });

    if (error) throw new Error(error.message);
    return { success: true };
  } catch (error: any) {
    throw new Error(`Failed to send approval email: ${error.message}`);
  }
}
