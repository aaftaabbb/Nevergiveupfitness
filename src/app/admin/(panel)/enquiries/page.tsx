import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { EnquiryActions, EnquiryStatusSelect } from "@/components/admin/enquiry-controls";
import { EmptyState } from "@/components/admin/empty-state";
import { listEnquiries } from "@/lib/dal/admin";
import { callHref } from "@/lib/brand";
import { formatDateTime } from "@/lib/dates";

export const metadata = { title: "Enquiries" };

type EnquiriesPageProps = {
  searchParams: Promise<{ status?: string }>;
};

const FILTERS = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "converted", label: "Converted" },
  { value: "dropped", label: "Dropped" },
];

export default async function AdminEnquiriesPage({ searchParams }: EnquiriesPageProps) {
  const { status = "all" } = await searchParams;
  const activeFilter = FILTERS.some((filter) => filter.value === status) ? status : "all";

  const enquiries = await listEnquiries(activeFilter);
  const newCount = enquiries.filter((enquiry) => enquiry.status === "new").length;

  return (
    <>
      <AdminPageHeader
        title="Enquiries"
        description={
          newCount > 0
            ? `${newCount} new ${newCount === 1 ? "lead" : "leads"} from the website`
            : "Leads from the website enquiry form"
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((filter) => (
          <Link
            key={filter.value}
            href={`/admin/enquiries?status=${filter.value}`}
            className={`border px-3 py-2.5 text-[10px] font-bold uppercase tracking-[0.12em] transition-colors ${
              activeFilter === filter.value
                ? "border-brand-red bg-brand-red text-text"
                : "border-line text-muted hover:border-brand-red hover:text-text"
            }`}
          >
            {filter.label}
          </Link>
        ))}
      </div>

      {enquiries.length === 0 ? (
        <EmptyState
          title="Nothing here yet"
          description={
            activeFilter === "all"
              ? "Website enquiries land here with the person's name, phone and what they are interested in."
              : `No ${activeFilter} enquiries. Switch filters to see the rest.`
          }
        />
      ) : (
        <ul className="space-y-2">
          {enquiries.map((enquiry) => (
            <li key={String(enquiry._id)} className="card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-base font-semibold text-text">{enquiry.name}</p>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
                    <a href={callHref} className="text-brand-red hover:underline">
                      {enquiry.phone}
                    </a>
                    {enquiry.email ? (
                      <a href={`mailto:${enquiry.email}`} className="hover:text-text">
                        {enquiry.email}
                      </a>
                    ) : null}
                    <span>{formatDateTime(enquiry.createdAt)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-32">
                    <EnquiryStatusSelect
                      enquiryId={String(enquiry._id)}
                      status={enquiry.status as string}
                    />
                  </div>
                  <EnquiryActions enquiryId={String(enquiry._id)} name={enquiry.name} />
                </div>
              </div>

              {enquiry.interest ? (
                <p className="mt-3 text-xs uppercase tracking-[0.12em] text-brand-gold">
                  {enquiry.interest}
                </p>
              ) : null}

              {enquiry.message ? (
                <p className="mt-2 border-l-2 border-line pl-3 text-sm leading-relaxed text-muted">
                  {enquiry.message}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <p className="mt-6 text-xs leading-relaxed text-muted">
        Marking an enquiry as converted is a reminder to create the member record. Enquiries do not
        create memberships by themselves.
      </p>
    </>
  );
}