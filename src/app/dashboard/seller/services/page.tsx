import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";

const servicesList = [
  { title: "Print on Demand", description: "Custom print your brand on T-shirts, mugs, and phone cases.", price: "R 15.00 / unit", icon: "🖨️" },
  { title: "Product Customization", description: "Add logos, custom colors, and packaging to your products.", price: "R 10.00 / unit", icon: "🎨" },
  { title: "Gift Boxes", description: "Premium packaging with satin ribbons, personalized cards, and boxes.", price: "R 25.00 / box", icon: "🎁" },
  { title: "Bulk Labeling", description: "Apply custom barcodes and brand labels to your inventory.", price: "R 5.00 / unit", icon: "🏷️" },
  { title: "Quality Control", description: "Inspect and approve products before they ship to customers.", price: "R 8.00 / unit", icon: "✅" },
  { title: "Warehouse Storage", description: "Store additional inventory safely in our temperature-controlled facilities.", price: "R 2.00 / kg / month", icon: "🏚️" }
];

export default function ServicesPage() {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-dark">Services</h1>
          <p className="text-muted text-sm">Enhance your products and operations with Velion Services.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {servicesList.map((service, index) => (
          <div key={index} className="bg-white rounded-xl border border-border shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="text-4xl mb-4">{service.icon}</div>
            <h3 className="text-lg font-semibold text-dark mb-1">{service.title}</h3>
            <p className="text-sm text-muted mb-4">{service.description}</p>
            <div className="flex items-center justify-between border-t border-border pt-4 mt-auto">
              <span className="text-sm font-bold text-primary">{service.price}</span>
              <Button variant="outline" className="text-xs px-4 py-2">Enquire Now</Button>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
