import { adminDb } from "@/lib/firebase/admin";
import type { NewsletterSubscriber } from "@lps/shared";

async function getSubscribers(): Promise<NewsletterSubscriber[]> {
  const snap = await adminDb.collection("newsletterSubscribers").orderBy("optInAt", "desc").get();
  return snap.docs.map((doc) => ({ ...(doc.data() as Omit<NewsletterSubscriber, "id">), id: doc.id }));
}

export default async function SubscribersPage() {
  const subscribers = await getSubscribers();
  const counts = subscribers.reduce(
    (acc, s) => {
      acc[s.status]++;
      return acc;
    },
    { pending: 0, subscribed: 0, unsubscribed: 0 } as Record<NewsletterSubscriber["status"], number>
  );

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <h1 className="text-2xl">Newsletter subscribers</h1>

      <div className="flex gap-8">
        <div>
          <p className="text-3xl">{counts.subscribed}</p>
          <p className="text-sm text-ink-500">Subscribed</p>
        </div>
        <div>
          <p className="text-3xl">{counts.pending}</p>
          <p className="text-sm text-ink-500">Pending confirmation</p>
        </div>
        <div>
          <p className="text-3xl">{counts.unsubscribed}</p>
          <p className="text-sm text-ink-500">Unsubscribed</p>
        </div>
      </div>

      {subscribers.length === 0 ? (
        <p className="text-ink-500 text-sm">No subscribers yet.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-ink-100 border border-ink-100 rounded-md">
          {subscribers.map((subscriber) => (
            <li key={subscriber.id} className="px-4 py-3 flex justify-between items-center">
              <div>
                <p>
                  {subscriber.email}
                  {subscriber.name ? ` — ${subscriber.name}` : ""}
                </p>
                <p className="text-sm text-ink-500">
                  {new Date(subscriber.optInAt).toLocaleDateString()} · {subscriber.optInSource}
                </p>
              </div>
              <span className="text-sm text-ink-500">{subscriber.status}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
