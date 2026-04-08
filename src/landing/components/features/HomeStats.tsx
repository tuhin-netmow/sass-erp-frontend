const stats = [
    { value: "23", label: "Integrated Modules" },
    { value: "1000+", label: "Active Users" },
    { value: "99.9%", label: "Uptime" },
    { value: "24/7", label: "Support Available" }
];

export function HomeStats() {
    return (
        <section className="py-10 md:py-20 text-white" style={{ backgroundImage: "url('/assets/img/bg-stats.webp')", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}>
            <div className="container">
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat, index) => (
                        <div key={index} className="text-center">
                            <div className="mb-2 text-4xl md:text-5xl font-bold">
                                {stat.value}
                            </div>
                            <div className="text-purple-100">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}