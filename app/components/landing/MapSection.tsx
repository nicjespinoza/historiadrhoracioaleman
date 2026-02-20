
export const MapSection = () => {
    const coords = "12.1352701,-86.2666613";
    const mapUrl = `https://maps.google.com/maps?q=${coords}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
    const wazeUrl = `https://waze.com/ul?ll=${coords}&navigate=yes`;
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${coords}`;

    return (
        <section className="w-full h-[600px] relative bg-[#00A63E]">
            {/* Interactive Google Map */}
            <div className="absolute inset-0 z-0 h-full w-full">
                <iframe
                    title="Ubicación Dr. Horacio Aleman"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight={0}
                    marginWidth={0}
                    src={mapUrl}
                    className="grayscale contrast-125 opacity-80 hover:grayscale-0 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-green-900/10 pointer-events-none"></div>
            </div>

            {/* Floating Navigation Controls */}
            <div className="absolute bottom-8 right-8 z-20 flex flex-col gap-3">
                <a
                    href={wazeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-[#33ccff] text-white px-6 py-3 rounded-full font-bold shadow-2xl hover:bg-[#29abe2] hover:scale-105 transition-all duration-300 group"
                >
                    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                        <path d="M19.4 13.5c-.3 0-.6-.1-.8-.3-.3-.2-.5-.5-.5-.9 0-.4.2-.7.5-.9.2-.2.5-.3.8-.3s.6.1.8.3c.3.2.5.5.5.9 0 .4-.2.7-.5.9-.2.2-.5.3-.8.3zm-7.4-4.5c.3 0 .6.1.8.3.3.2.5.5.5.9 0 .4-.2.7-.5.9-.2.2-.5.3-.8.3s-.6-.1-.8-.3c-.3-.2-.5-.5-.5-.9 0-.4.2-.7.5-.9.2-.2.5-.3.8-.3zm3.7 4.5c-.3 0-.6-.1-.8-.3-.3-.2-.5-.5-.5-.9 0-.4.2-.7.5-.9.2-.2.5-.3.8-.3s.6.1.8.3c.3.2.5.5.5.9 0 .4-.2.7-.5.9-.2.2-.5.3-.8.3zm3.7-4.5c.3 0 .6.1.8.3.3.2.5.5.5.9 0 .4-.2.7-.5.9-.2.2-.5.3-.8.3s-.6-.1-.8-.3c-.3-.2-.5-.5-.5-.9 0-.4.2-.7.5-.9.2-.2.5-.3.8-.3zM12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm7.6 12.8c-.8 2.3-2.9 4.2-5.4 4.7-.6.1-1.2.2-1.8.2-.4 0-.8-.1-1.2-.2l-2.9.8c-.3.1-.6-.1-.6-.4v-2.3c-2.8-1.2-4.7-4-4.7-7.2 0-4.4 3.6-8 8-8s8 3.6 8 8c0 1.9-.7 3.7-1.8 5.1-.2.3-.4.6-.6.9z" />
                    </svg>
                    Abrir en Waze
                </a>
                <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-white text-gray-900 px-6 py-3 rounded-full font-bold shadow-2xl hover:bg-gray-100 hover:scale-105 transition-all duration-300 group"
                >
                    <img src="https://www.gstatic.com/images/branding/product/2x/maps_96dp.png" alt="GMaps" className="w-6 h-6" />
                    Google Maps
                </a>
            </div>

            {/* Custom Marker UI (Overlay) */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
                <div className="flex flex-col items-center">
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-4 w-64 text-center border border-green-500/20">
                        <h3 className="font-bold text-gray-900 text-base mb-1">Consultorio Dr. Alemán</h3>
                        <p className="text-gray-500 text-xs mb-2">Visítanos en nuestra clínica</p>
                        <div className="w-8 h-1 bg-green-500 mx-auto rounded-full"></div>
                    </div>
                    <div className="mt-4 text-green-600 drop-shadow-xl animate-bounce">
                        <span className="material-symbols-outlined text-6xl fill-current">location_on</span>
                    </div>
                </div>
            </div>
        </section>
    );
};
