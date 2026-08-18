import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, code: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Velion <onboarding@resend.dev>', // Pode alterar depois para o seu domínio
      to: [email],
      subject: 'Velion Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
          <h2 style="color: #1A1A1A;">Welcome to Velion</h2>
          <p style="color: #6B7280; font-size: 16px;">Use the code below to verify your email address and start climbing.</p>
          <div style="background-color: #F4F4F7; padding: 24px; border-radius: 12px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #3B82F6;">${code}</span>
          </div>
          <p style="color: #6B7280; font-size: 14px;">This code expires in 10 minutes.</p>
          <p style="color: #6B7280; font-size: 14px;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });

    if (error) throw new Error(error.message);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
