/** @deprecated Import from @/lib/catalogue-server or @/lib/catalogue-format instead */
export { catalogue } from "@/lib/catalogue-server";
export {
  getCatalogueItemBySlug as getVehicleBySlug,
  getFeaturedCatalogueItems as getFeaturedVehicles,
} from "@/lib/catalogue-server";
export {
  formatPrice,
  getSpecValue,
  formatStockStatus,
  getPrimaryImage,
} from "@/lib/catalogue-format";
