var modal = "";

function ShowModal(title, description) {
  modal = document.getElementById("myModal");
  modal.style.display = "block";
  $("#modalDescription").html(description);
  $("#modalTitle").html(title);
}

function HideModal() {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};
