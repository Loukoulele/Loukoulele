import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Wizard IDLE",
  description: "Privacy Policy for Wizard IDLE by Loukoulele",
};

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 20px", fontFamily: "system-ui, sans-serif", color: "#e0e0e0", backgroundColor: "#1a1a2e", minHeight: "100vh" }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Privacy Policy</h1>
      <p style={{ color: "#999", marginBottom: 32 }}>Last updated: February 9, 2026</p>

      <p>
        Wizard IDLE (&quot;the Game&quot;) is developed by Loukoulele. This policy describes how we handle your data when you use the Game.
      </p>

      <h2 style={{ fontSize: 20, marginTop: 32 }}>Data We Collect</h2>
      <p>The Game collects minimal data to function properly:</p>
      <ul>
        <li><strong>Game progress</strong> — saved locally on your device (localStorage). We do not store your game data on our servers.</li>
        <li><strong>Analytics &amp; diagnostics</strong> — we use Firebase Analytics to collect anonymous usage data (pages visited, crashes, device type). No personally identifiable information is collected.</li>
        <li><strong>Purchase data</strong> — in-app purchases are processed by Google Play and RevenueCat. We receive a transaction confirmation but never see your payment details.</li>
      </ul>

      <h2 style={{ fontSize: 20, marginTop: 32 }}>Data We Do NOT Collect</h2>
      <ul>
        <li>No personal information (name, email, phone number)</li>
        <li>No location data</li>
        <li>No contacts or photos</li>
        <li>No account creation required</li>
      </ul>

      <h2 style={{ fontSize: 20, marginTop: 32 }}>Third-Party Services</h2>
      <ul>
        <li><strong>Firebase Analytics</strong> (Google) — <a href="https://firebase.google.com/support/privacy" style={{ color: "#7b8cff" }}>Privacy Policy</a></li>
        <li><strong>RevenueCat</strong> — <a href="https://www.revenuecat.com/privacy" style={{ color: "#7b8cff" }}>Privacy Policy</a></li>
        <li><strong>Google Play Billing</strong> — <a href="https://policies.google.com/privacy" style={{ color: "#7b8cff" }}>Privacy Policy</a></li>
      </ul>

      <h2 style={{ fontSize: 20, marginTop: 32 }}>Data Retention</h2>
      <p>Game progress is stored locally and can be deleted by clearing the app data. Analytics data is retained by Firebase according to their standard retention policy.</p>

      <h2 style={{ fontSize: 20, marginTop: 32 }}>Children&apos;s Privacy</h2>
      <p>The Game is not directed at children under 13. We do not knowingly collect data from children under 13.</p>

      <h2 style={{ fontSize: 20, marginTop: 32 }}>Data Deletion</h2>
      <p>To delete your data, simply uninstall the app or clear the app data from your device settings. For any additional requests, contact us at the email below.</p>

      <h2 style={{ fontSize: 20, marginTop: 32 }}>Contact</h2>
      <p>For any questions regarding this privacy policy, contact us at: <a href="mailto:loukouleledev@gmail.com" style={{ color: "#7b8cff" }}>loukouleledev@gmail.com</a></p>
    </div>
  );
}
