
export const MapSection = () => {
    return (
        <section className="w-full h-[500px] relative">
            <div className="absolute inset-0 z-0 bg-gray-900">
                <img
                    alt="Satellite Map Background"
                    className="w-full h-full object-cover opacity-80"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-9RjjbEtlKKiTPakmZfHRfh3ikIxi8y_71MXheZiAeNbmRBO4B2XWA5JdOIGYUzX3ysIVbdBZmKaW_n5xpV9wzXLtg7ZLgJQMiwjPrRrc2p4bxqQZaWNaGRcfdTduLEcs2q35L5sb8wz3m93E38PUQJxUGmxJmCTXkmtuwuOmnhW_x-l4k4j8TPXLT6EhPMkpdJ5r8cxH-R7uvGE6yV8nLynLQl5N3-ccpu99G6SAJk6FoXimZAw0OC05c32N6QUmGFVxY3rlnl__"
                />
                <div className="absolute inset-0 bg-black/20"></div>
            </div>

            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="flex flex-col items-center">
                    <div className="bg-white rounded-lg shadow-lg p-4 w-64 text-center animate-fade-in-up relative">
                        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
                            <span className="material-icons-outlined text-sm">close</span>
                        </button>
                        <h3 className="font-bold text-gray-900 text-base mb-1">Dr. Horacio Aleman</h3>
                        <a href="#" className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline">Direcciones</a>
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rotate-45"></div>
                    </div>
                    <div className="mt-4 text-red-600 drop-shadow-md">
                        <span className="material-symbols-outlined text-5xl fill-current">location_on</span>
                    </div>
                </div>
            </div>

            <div className="absolute top-4 left-4 z-10">
                <div className="bg-white px-3 py-2 rounded shadow text-sm font-medium text-gray-700">Satélite</div>
            </div>
            {/* Map controls can be decorative images or simplified */}
        </section>
    );
};
