import React from "react";

function CardList() {
  return (
    <>
      <div className="mb-0 flex flex-col items-center justify-center space-x-0 space-y-12  bg-[#E5E5E5] md:flex-row md:space-x-8 md:space-y-0">
        <div className="rounded-xl bg-[#FFFBEC]">
          <div className="flex w-96 translate-x-4 translate-y-4 flex-col rounded-xl bg-white p-8 shadow-xl md:w-auto">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Ice_logo.svg/138px-Ice_logo.svg.png?20191213230535"
              className="w-8"
            />
            <div className="mt-3 text-lg font-semibold text-blue-400">
              Ice Mobile 10GB
            </div>
            <div className="text-sm font-light">Up to 100Mbit/s</div>
            <div className="my-4">
              <span className="text-base font-bold">299,-</span>
              <span className="text-sm font-light">/month</span>
            </div>

            <button className="mt-4 rounded-full border border-[#F0F0F6]  bg-[#F4F5FA] px-4 py-3 shadow-xl">
              Add subscription
            </button>
          </div>
        </div>

        <div className="rounded-xl bg-[#FFFBEC]">
          <div className="flex w-96 translate-x-4 translate-y-4 flex-col rounded-xl bg-white p-8 shadow-xl md:w-auto">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Ice_logo.svg/138px-Ice_logo.svg.png?20191213230535"
              className="w-8"
            />
            <div className="mt-3 text-lg font-semibold">Ice Mobile 10GB</div>
            <div className="text-sm font-light">Up to 100Mbit/s</div>
            <div className="my-4">
              <span className="text-base font-bold">299,-</span>
              <span className="text-sm font-light">/month</span>
            </div>

            <button className="mt-4 rounded-full border border-[#F0F0F6]  bg-[#F4F5FA] px-4 py-3 shadow-xl">
              Add subscription
            </button>
          </div>
        </div>

        <div className="rounded-xl bg-[#FFFBEC]">
          <div className="flex w-96 translate-x-4 translate-y-4 flex-col rounded-xl bg-white p-8 shadow-xl md:w-auto">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Ice_logo.svg/138px-Ice_logo.svg.png?20191213230535"
              className="w-8"
            />
            <div className="mt-3 text-lg font-semibold">Ice Mobile 10GB</div>
            <div className="text-sm font-light">Up to 100Mbit/s</div>
            <div className="my-4">
              <span className="text-base font-bold">299,-</span>
              <span className="text-sm font-light">/month</span>
            </div>

            <button className="mt-4 rounded-full border border-[#F0F0F6]  bg-[#F4F5FA] px-4 py-3 shadow-xl">
              Add subscription
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default CardList;
