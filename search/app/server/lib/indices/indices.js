// define settings and mapping for td-central elastic search indices
SearchService.Indices.User = {
  "settings": SearchService.Type.Settings,
  "mappings": {
    "locations": SearchService.Type.Locations,
    "users": SearchService.Type.Users
  }
};

SearchService.Indices.Order = {
  "settings": SearchService.Type.Settings,
  "mappings": {
    "promotions": SearchService.Type.Promotions,
    "promotionrebates": SearchService.Type.PromotionRebates,
    "customers": SearchService.Type.Customers,
    "orders": SearchService.Type.Orders,
    "customertransactions": SearchService.Type.CustomerTransactions,
    "invoices": SearchService.Type.Invoices,
    "returnorders": SearchService.Type.ReturnOrders,
    "payments": SearchService.Type.Payments,
    "shipments": SearchService.Type.Shipments
  }
};

SearchService.Indices.Product = {
  "settings": SearchService.Type.Settings,
  "mappings": {
    "pricelists": SearchService.Type.PriceList,
    "products": SearchService.Type.Products,
    "productvariants": SearchService.Type.ProductVariant
  }
};
