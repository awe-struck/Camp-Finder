(() => {
  const starRatingForm = document.querySelector(".validated-stars-rating");
  const status = document.querySelector("#status");
  const defaultStarRating = document.querySelector(".input-no-rate");

  if (starRatingForm) {
    starRatingForm.addEventListener("submit", (event) => {
      if (defaultStarRating.checked) {
        status.classList.remove("d-none");
        event.preventDefault();
      } else {
        status.classList.add("d-none");
      }
    });
  }
})();
