import React from "react";

function CardList() {
  return (
    <>
      <div className="flex flex-col bg-[#E5E5E5] font-epilogue text-black">
        {/* <!-- main card --> */}
        <div className="rounded-xl bg-[#F4F5FA] p-10">
          {/* <!-- headers content--> */}
          <div className="flex flex-col items-center justify-center text-center">
            <div className="max-w-sm font-epilogue font-extrabold">
              Browse and join your favorite club
            </div>
            <div className="mt-5 max-w-lg text-sm font-light">
              All devices come with free delivery or pickup as standard. See
              information on available shopping options for your location.
            </div>
          </div>

          {/* <!-- subscriptions --> */}
          <div className="mt-10 flex flex-col items-center justify-center space-x-0  space-y-12 md:flex-row md:space-x-8 md:space-y-0">
            <div className="rounded-xl bg-[#f1c830]">
              <div className="flex w-96 translate-x-4 translate-y-4 flex-col rounded-xl bg-white p-8 shadow-xl md:w-auto">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Ice_logo.svg/138px-Ice_logo.svg.png?20191213230535"
                  className="w-8"
                />
                <div className="mt-3 text-lg font-semibold">
                  Ice Mobile 10GB
                </div>
                <div className="text-sm font-light">Up to 100Mbit/s</div>
                <div className="my-4">
                  <span className="text-base font-bold">299,-</span>
                  <span className="text-sm font-light">/month</span>
                </div>

                <button className="mt-4 rounded-full border border-[#57578d] bg-[#98a6eb] px-4  py-3 shadow-xl shadow-slate-600 hover:bg-sky-500">
                  Add subscription
                </button>
              </div>
            </div>

            <div className="rounded-xl bg-[#F9ECFF]">
              <div className="flex w-96 translate-x-4 translate-y-4 flex-col rounded-xl bg-white p-8 shadow-xl md:w-auto">
                <img
                  src="https://www.dstny.se/app/uploads/telia_pp_rgb.png.webp"
                  className="w-12"
                />
                <div className="mt-3 text-lg font-semibold">
                  Telia Mobil 15GB
                </div>
                <div className="w-60 text-sm font-light md:w-auto">
                  Unlimited calls
                </div>
                <div className="my-4">
                  <span className="text-base font-bold">953,-</span>
                  <span className="text-sm font-light">/month</span>
                </div>

                <button className="mt-4 rounded-full border border-[#F0F0F6]  bg-[#F4F5FA] px-4 py-3 shadow-xl shadow-slate-600">
                  Add subscription
                </button>
              </div>
            </div>

            <div className="rounded-xl bg-[#ECEEFF]">
              <div className="flex w-96 translate-x-4 translate-y-4 flex-col rounded-xl bg-white p-8 shadow-xl md:w-auto">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Telenor_Logo.svg/1600px-Telenor_Logo.svg.png"
                  className="w-12"
                />
                <div className="mt-3 text-lg font-semibold">
                  Telenor Next Fast
                </div>
                <div className="w-60 text-sm font-light md:w-auto">
                  Up to 100Mbit/s
                </div>
                <div className="my-4">
                  <span className="text-base font-bold">1028,-</span>
                  <span className="text-sm font-light">/month</span>
                </div>

                <button className="mt-4 rounded-full border border-[#F0F0F6]  bg-[#F4F5FA] px-4 py-3 shadow-xl">
                  Add subscription
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <button className="mt-12 rounded-full bg-slate-900 px-4 py-3 text-white">
              See all subscriptions
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default CardList;
