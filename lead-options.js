/*
  Single source for the enquiry choices and the lead spreadsheet.

  The form (script.js) and /api/submit-lead both read this file.
  Change labels, sheet colours, or scores here only.

  Colours are for the Google Sheet column dropdowns, not the website form.
  Project Type "other" is the free-text field on the form. Those words are
  stored in the Project Type column. The sheet dropdown also lists "Other".

  lead qualify score is assigned from the budget range:
    3L-10L → 50, 10L-30L → 70, 30L-90L → 90, 1C-5C → 100
*/

(function (root, factory) {
  const leadForm = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = leadForm;
  }

  if (root) {
    root.LEAD_FORM = leadForm;
  }
})(typeof window !== "undefined" ? window : globalThis, function () {
  const services = [
    { value: "Interior Design", label: "Interior Design", color: "#F4E4D4" },
    { value: "Architecture", label: "Architecture", color: "#D5E6DA" },
    { value: "Both", label: "Both", color: "#E3DDF2" },
  ];

  const projectTypes = [
    { value: "Residential", label: "Residential", color: "#F4E4D4" },
    { value: "Commercial", label: "Commercial", color: "#D5E3F0" },
    { value: "Restaurant", label: "Restaurant", color: "#F8D7C4" },
    { value: "Hotel", label: "Hotel", color: "#D9EAD8" },
    { value: "Hospital", label: "Hospital", color: "#E4DDF3" },
    { value: "other", label: "Other", color: "#E6E6E6", allowsText: true },
  ];

  const budgets = [
    { value: "3L-10L", label: "3L-10L", color: "#F8F1E6", score: 50 },
    { value: "10L-30L", label: "10L-30L", color: "#F0DCC4", score: 70 },
    { value: "30L-90L", label: "30L-90L", color: "#E0C49A", score: 90 },
    { value: "1C-5C", label: "1C-5C", color: "#C9A66B", score: 100 },
  ];

  const headers = [
    "S.NO",
    "Date",
    "Name",
    "Phone no",
    "Email",
    "Service interest",
    "Project Type",
    "Budget",
    "Project brief",
    "lead qualify score",
  ];

  function find(list, value) {
    return list.find((item) => item.value === value) || null;
  }

  return {
    headers,
    services,
    projectTypes,
    budgets,
    isService(value) {
      return Boolean(find(services, value));
    },
    isProject(value) {
      return Boolean(find(projectTypes, value));
    },
    isBudget(value) {
      return Boolean(find(budgets, value));
    },
    projectAllowsText(value) {
      const item = find(projectTypes, value);
      return Boolean(item && item.allowsText);
    },
    /* Value shown inside the Google Sheet dropdown for this choice. */
    sheetValue(option) {
      return option.allowsText ? option.label : option.value;
    },
    scoreForBudget(value) {
      const item = find(budgets, value);
      return item ? item.score : null;
    },
  };
});
