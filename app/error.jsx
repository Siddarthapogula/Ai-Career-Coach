"use client";

export default function GlobalError({ error, reset }) {
  return (
      <div className=" mt-34 flex h-screen items-center justify-center flex-col">
        <h1 className="text-2xl font-bold text-red-600">
          Something went wrong
        </h1>
        <p className="mt-2 text-gray-700">
          {"Something went wrong our side, we will fix asap. Try clicking the button below"}
        </p>
        <button
          className="mt-4 px-4 py-2 cursor-pointer bg-blue-500 text-white rounded"
          onClick={() => reset()}
        >
          Try again
        </button>
        </div>
  );
}
