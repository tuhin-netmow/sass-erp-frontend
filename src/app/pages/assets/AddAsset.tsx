import { useState } from "react";
import { useNavigate } from "react-router";
import { useCreateAssetMutation } from "@/store/features/app/assets/assetsApiService";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { ArrowLeft, Save } from "lucide-react";
import { Link } from "react-router";
import { toast } from "sonner";

export default function AddAsset() {
  const navigate = useNavigate();
  const [createAsset, { isLoading }] = useCreateAssetMutation();

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    type: "",
    location: "",
    purchaseDate: "",
    purchaseCost: "",
    depreciationRate: "",
    warrantyExpiry: "",
    description: "",
    serialNumber: "",
    manufacturer: "",
    model: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAsset({
        ...formData,
        purchaseCost: Number(formData.purchaseCost),
        depreciationRate: Number(formData.depreciationRate),
      }).unwrap();
      toast.success("Asset created successfully");
      navigate("/assets");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create asset");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/assets">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Asset</h1>
          <p className="text-muted-foreground mt-1">
            Register a new asset in your company inventory
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Asset Information</CardTitle>
            <CardDescription>
              Enter the basic details of the asset
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Asset Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Office Laptop, Delivery Van"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                  required
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="furniture">Furniture</SelectItem>
                    <SelectItem value="vehicles">Vehicles</SelectItem>
                    <SelectItem value="machinery">Machinery</SelectItem>
                    <SelectItem value="equipment">Equipment</SelectItem>
                    <SelectItem value="buildings">Buildings</SelectItem>
                    <SelectItem value="land">Land</SelectItem>
                    <SelectItem value="software">Software</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Input
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  placeholder="e.g., Laptop, Desk, Truck"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., Main Office, Warehouse"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="purchaseDate">Purchase Date *</Label>
                <Input
                  id="purchaseDate"
                  name="purchaseDate"
                  type="date"
                  value={formData.purchaseDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="purchaseCost">Purchase Cost ($) *</Label>
                <Input
                  id="purchaseCost"
                  name="purchaseCost"
                  type="number"
                  step="0.01"
                  value={formData.purchaseCost}
                  onChange={handleChange}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="depreciationRate">
                  Depreciation Rate (% per year)
                </Label>
                <Input
                  id="depreciationRate"
                  name="depreciationRate"
                  type="number"
                  step="0.1"
                  value={formData.depreciationRate}
                  onChange={handleChange}
                  placeholder="e.g., 10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="warrantyExpiry">Warranty Expiry</Label>
                <Input
                  id="warrantyExpiry"
                  name="warrantyExpiry"
                  type="date"
                  value={formData.warrantyExpiry}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter asset description..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Details</CardTitle>
            <CardDescription>
              Optional specifications and manufacturer information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="serialNumber">Serial Number</Label>
                <Input
                  id="serialNumber"
                  name="serialNumber"
                  value={formData.serialNumber}
                  onChange={handleChange}
                  placeholder="Enter serial number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="manufacturer">Manufacturer</Label>
                <Input
                  id="manufacturer"
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleChange}
                  placeholder="e.g., Dell, Toyota"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  placeholder="e.g., Latitude 5420, Camry"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link to="/assets">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isLoading} className="gap-2">
            <Save className="h-4 w-4" />
            {isLoading ? "Creating..." : "Create Asset"}
          </Button>
        </div>
      </form>
    </div>
  );
}
