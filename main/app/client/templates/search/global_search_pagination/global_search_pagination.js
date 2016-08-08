/*****************************************************************************/
/* GlobalSearchPagination: Event Handlers */
/*****************************************************************************/
Template.GlobalSearchPagination.events({
  'click .view-prev-set': function (e, tmpl) {
    Template.instance().currentPage.set(Template.instance().currentPage.get() - 1);
  },
  'click .view-next-set': function (e, tmpl) {
    Template.instance().currentPage.set(Template.instance().currentPage.get() + 1);
  }
});

/*****************************************************************************/
/* GlobalSearchPagination: Helpers */
/*****************************************************************************/
Template.GlobalSearchPagination.helpers({
  filteredData: function () {
    return Template.instance().data.data || [];
  },
  currentDocumentSet: function () {
    let currentPage = Template.instance().currentPage.get();
    let resultsPerPage = Template.instance().resultsPerPage.get();
    let filteredData = Template.GlobalSearchPagination.__helpers.get('filteredData').call();
    return filteredData.chunk(resultsPerPage)[currentPage - 1];
  },
  numberOfPages: function () {
    let filteredDataCount = Template.GlobalSearchPagination.__helpers.get('filteredData').call().length || [];
    let resultsPerPage = Template.instance().resultsPerPage.get();
    let pages = 0;
    let divisionValue = filteredDataCount / resultsPerPage;
    let modulusValue = filteredDataCount % resultsPerPage;
    pages += parseInt(divisionValue);
    if (modulusValue > 0) {
      pages += 1;
    }
    return pages;
  },
  currentPage: function () {
    if (Template.instance().currentPage.get() > Template.GlobalSearchPagination.__helpers.get('numberOfPages').call()) {
      Template.instance().currentPage.set(1);
    }
    return Template.instance().currentPage.get();
  },
  hasPrevious: function () {
    return Template.instance().currentPage.get() !== 1;
  },
  hasNext: function () {
    return Template.GlobalSearchPagination.__helpers.get('numberOfPages').call() > Template.instance().currentPage.get();
  },
  isCustomers: function () {
    return Template.instance().data.type === 'customers';
  },
  isOrders: function () {
    return Template.instance().data.type === 'orders';
  },
  isReturns: function () {
    return Template.instance().data.type === 'returnorders';
  },
  isPromotions: function () {
    return Template.instance().data.type === 'promotions';
  },
  isProductVariants: function () {
    return Template.instance().data.type === 'productvariants';
  },
  isInvoices: function () {
    return Template.instance().data.type === 'invoices';
  }
});

/*****************************************************************************/
/* GlobalSearchPagination: Lifecycle Hooks */
/*****************************************************************************/
Template.GlobalSearchPagination.onCreated(function () {
  let instance = Template.instance();
  instance.currentPage = new ReactiveVar(1);
  instance.resultsPerPage = new ReactiveVar(5);
});

Template.GlobalSearchPagination.onRendered(function () {
  let instance = Template.instance();
  instance.currentPage.set(1);
  instance.resultsPerPage.set(5);
});

Template.GlobalSearchPagination.onDestroyed(function () {
});
