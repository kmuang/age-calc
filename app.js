// Input selectors
const form = document.querySelector("form");
const dayInput = document.getElementById("day");
const monthInput = document.getElementById("month");
const yearInput = document.getElementById("year");

// Error selectors
const errorDay = document.querySelector(".error__day");
const errorMonth = document.querySelector(".error__month");
const errorYear = document.querySelector(".error__year");

// Result selectors
const resultYear = document.querySelector(".lines__year");
const resultMonth = document.querySelector(".lines__month");
const resultDay = document.querySelector(".lines__day");
const errorDate = document.getElementById("error-date");
const formAnnouncement = document.getElementById("form-announcement");
const resultAnnouncement = document.getElementById("result-announcement");

yearInput.max = String(new Date().getFullYear());

form.addEventListener("submit", function (e) {
  e.preventDefault();
  validateForm();
});

// Functions
function validateForm() {
  const day = dayInput.valueAsNumber;
  const month = monthInput.valueAsNumber;
  const year = yearInput.valueAsNumber;
  const currentDate = new Date();
  const today = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate()
  );
  const errors = {
    day: "",
    month: "",
    year: "",
  };
  let dateError = "";

  if (!Number.isInteger(year) || year < 1900 || year > currentDate.getFullYear()) {
    errors.year = "Must be a valid year";
  }

  if (!Number.isInteger(month) || month < 1 || month > 12) {
    errors.month = "Must be a valid month";
  }

  if (!Number.isInteger(day) || day < 1 || day > 31) {
    errors.day = "Must be a valid day";
  } else if (!errors.month && !errors.year && day > new Date(year, month, 0).getDate()) {
    errors.day = "Must be a valid date";
  }

  if (!errors.day && !errors.month && !errors.year) {
    const birthDate = new Date(year, month - 1, day);

    if (birthDate > today) {
      dateError = "Date cannot be in the future";
    }
  }

  const fieldErrors = [
    { input: dayInput, error: errorDay, message: errors.day },
    { input: monthInput, error: errorMonth, message: errors.month },
    { input: yearInput, error: errorYear, message: errors.year },
  ];

  fieldErrors.forEach(({ input, error, message }) => {
    const hasError = Boolean(message || dateError);
    error.textContent = message;
    input.setAttribute("aria-invalid", String(hasError));
    input.closest(".input__group").classList.toggle("has-error", hasError);
  });
  errorDate.textContent = dateError;

  if (errors.day || errors.month || errors.year || dateError) {
    resultYear.textContent = "--";
    resultMonth.textContent = "--";
    resultDay.textContent = "--";

    const messages = fieldErrors
      .filter(({ message }) => message)
      .map(({ input, message }) => `${input.name}: ${message}`);
    if (dateError) messages.push(dateError);
    formAnnouncement.textContent = `Please correct the following: ${messages.join(". ")}`;
    resultAnnouncement.textContent = "";
    return;
  }

  formAnnouncement.textContent = "";
  let totalMonths =
    (today.getFullYear() - year) * 12 + today.getMonth() - (month - 1);
  const getAnniversary = (monthOffset) => {
    const anniversaryMonth = month - 1 + monthOffset;
    const anniversaryYear = year + Math.floor(anniversaryMonth / 12);
    const normalizedMonth = anniversaryMonth % 12;
    const lastDayOfMonth = new Date(anniversaryYear, normalizedMonth + 1, 0).getDate();

    return new Date(anniversaryYear, normalizedMonth, Math.min(day, lastDayOfMonth));
  };

  let anniversary = getAnniversary(totalMonths);
  if (anniversary > today) {
    totalMonths--;
    anniversary = getAnniversary(totalMonths);
  }

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const days = Math.round(
    (Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) -
      Date.UTC(anniversary.getFullYear(), anniversary.getMonth(), anniversary.getDate())) /
      (24 * 60 * 60 * 1000)
  );

  animateValue(years, resultYear);
  animateValue(months, resultMonth);
  animateValue(days, resultDay);
  resultAnnouncement.textContent = `Age: ${years} years, ${months} months, and ${days} days`;

  submitToFormspree();
}

// Send the submitted birth date (day/month/year fields) to Formspree
function submitToFormspree() {
  fetch(form.action, {
    method: "POST",
    headers: { Accept: "application/json" },
    body: new FormData(form),
  }).catch(() => {
    // Silently ignore network/submission errors so the UI isn't blocked
  });
}

// Animate the value
function animateValue(val, elem) {
  let current = 0;
  let interval = setInterval(function () {
    // Animate value if it's greater than 0
    if (val > 0) {
      current += 1;
    }

    elem.textContent = current;

    if (current >= val) {
      clearInterval(interval);
    }
  }, 100);
}
