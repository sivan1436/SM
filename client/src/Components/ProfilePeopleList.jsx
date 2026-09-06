import { ArrowLeft, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";

function ProfilePeopleList({ title, people, onClose }) {
  const navigate = useNavigate();

  return (
    <section className="mt-6 rounded-2xl bg-white p-5 shadow">
      <div className="mb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          aria-label="Back to profile"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      </div>

      {people.length ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {people.map((person) => (
            <button
              type="button"
              key={person._id}
              onClick={() => navigate(`/profile/${person._id}`)}
              className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-left transition hover:border-indigo-300 hover:bg-indigo-50/40"
            >
              {person.profile_picture ? (
                <img
                  src={person.profile_picture}
                  alt=""
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <UserRound className="h-6 w-6" />
                </span>
              )}
              <span className="min-w-0">
                <span className="block truncate font-medium text-slate-900">
                  {person.full_name}
                </span>
                <span className="block truncate text-sm text-slate-500">
                  @{person.username}
                </span>
              </span>
            </button>
          ))}
        </div>
      ) : (
        <p className="py-8 text-center text-sm text-slate-500">
          No {title.toLowerCase()} yet.
        </p>
      )}
    </section>
  );
}

export default ProfilePeopleList;