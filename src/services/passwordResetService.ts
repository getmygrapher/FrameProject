import { supabase } from '../lib/supabase';

export class PasswordResetService {
  // Request password reset
  static async requestPasswordReset(email: string, onDevNotification?: (msg: string) => void): Promise<void> {
    // First check if user exists and is an admin
    const { data: adminUsers, error: adminError } = await supabase
      .from('admin_users')
      .select('id, email, is_active')
      .eq('email', email)
      .eq('is_active', true)
      .limit(1);

    if (adminError) {
      console.error('Error checking admin user:', adminError);
      throw new Error('Failed to verify admin user');
    }

    const adminUser = adminUsers?.[0];
    if (!adminUser) {
      throw new Error('Admin user not found or inactive');
    }

    // Generate reset token
    const token = this.generateSecureToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

    // Store reset token
    const { error: tokenError } = await supabase
      .from('password_reset_tokens')
      .insert({
        user_id: adminUser.id,
        token,
        expires_at: expiresAt.toISOString()
      });

    if (tokenError) {
      console.error('Error storing reset token:', tokenError);
      throw new Error('Failed to generate reset token');
    }

    // Send reset email (in production, this would use a proper email service)
    await this.sendResetEmail(email, token, onDevNotification);
  }

  // Verify reset token
  static async verifyResetToken(token: string): Promise<{ valid: boolean; userId?: string }> {
    const { data, error } = await supabase
      .from('password_reset_tokens')
      .select('user_id, expires_at, used')
      .eq('token', token)
      .single();

    if (error) {
      console.error('Error verifying token:', error);
      return { valid: false };
    }

    if (!data) {
      return { valid: false };
    }

    const now = new Date();
    const expiresAt = new Date(data.expires_at);

    if (data.used || now > expiresAt) {
      return { valid: false };
    }

    return { valid: true, userId: data.user_id };
  }

  // Reset password with token
  static async resetPassword(token: string, newPassword: string): Promise<void> {
    // Verify token first
    const verification = await this.verifyResetToken(token);
    if (!verification.valid || !verification.userId) {
      throw new Error('Invalid or expired reset token');
    }

    // Update password using Supabase Auth API
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (updateError) {
      console.error('Error updating password:', updateError);
      throw new Error('Failed to update password');
    }

    // Mark token as used
    const { error: tokenError } = await supabase
      .from('password_reset_tokens')
      .update({ used: true })
      .eq('token', token);

    if (tokenError) {
      console.error('Error marking token as used:', tokenError);
    }
  }

  // Generate secure random token
  private static generateSecureToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Send reset email (mock implementation - replace with actual email service)
  // Accepts an optional onDevNotification callback for development feedback
  private static async sendResetEmail(email: string, token: string, onDevNotification?: (msg: string) => void): Promise<void> {
    const resetUrl = `${window.location.origin}/admin?token=${token}`;
    
    // In production, replace this with actual email service (SendGrid, AWS SES, etc.)
    console.log(`Password reset email would be sent to: ${email}`);
    console.log(`Reset URL: ${resetUrl}`);
    
    // For development, use callback for notification instead of alert
    if (import.meta.env.DEV && onDevNotification) {
      onDevNotification(`Development Mode: Password reset link:\n${resetUrl}\n\nCopy this URL and paste it in your browser to reset the password.`);
    }
    
    // Example with a real email service:
    /*
    const emailData = {
      to: email,
      subject: 'FrameCraft Pro Admin - Password Reset',
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested a password reset for your FrameCraft Pro admin account.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this reset, please ignore this email.</p>
      `
    };
    
    await emailService.send(emailData);
    */
  }

  // Cleanup expired tokens (can be called periodically)
  static async cleanupExpiredTokens(): Promise<void> {
    const { error } = await supabase
      .from('password_reset_tokens')
      .delete()
      .or('expires_at.lt.now(),used.eq.true');

    if (error) {
      console.error('Error cleaning up expired tokens:', error);
    }
  }
}