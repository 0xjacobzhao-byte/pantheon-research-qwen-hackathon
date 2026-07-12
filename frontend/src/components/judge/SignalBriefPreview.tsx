import type { SignalPreview } from "../../api";

/**
 * SignalBriefPreview — a Telegram-style mock of the signal delivery layer.
 *
 * No real Telegram call is made — this renders the same ``message_preview``
 * string the backend builds offline from bundled samples. It exists to make
 * the signal layer tangible without sending anything or requiring
 * credentials.
 */

function deliveryBadgeColor(state: string): string {
  return state === "HUMAN_REVIEW_REQUIRED" ? "var(--warning)" : "var(--success)";
}

export default function SignalBriefPreview({ preview }: { preview: SignalPreview }) {
  return (
    <div className="signal-preview" data-testid="signal-brief-preview">
      <div className="signal-preview-meta">
        <span className="signal-channel">{preview.channel}</span>
        <span
          className="badge signal-delivery-badge"
          style={{ backgroundColor: deliveryBadgeColor(preview.delivery_state) }}
        >
          {preview.delivery_state}
        </span>
      </div>

      <div className="telegram-bubble">
        <pre className="telegram-message">{preview.message_preview}</pre>
      </div>

      <div className="signal-flags">
        <span className="signal-flag">
          real_telegram_call: <strong>{String(preview.real_telegram_call)}</strong>
        </span>
        <span className="signal-flag">
          credentials_used: <strong>{String(preview.credentials_used)}</strong>
        </span>
        <span className="signal-flag">
          external_network_call: <strong>{String(preview.external_network_call)}</strong>
        </span>
      </div>

      <p className="signal-disclaimer">⚠️ {preview.disclaimer}</p>
    </div>
  );
}
