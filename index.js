let myIndex = 0;
carousel();

function carousel() {
  let i;
  let x = document.getElementsByClassName("famousSlide");
  for (i = 0; i < x.length; i++) {
    x[i].style.display = "none";
  }
  myIndex++;
  if (myIndex > x.length) {
    myIndex = 1;
  }
  x[myIndex - 1].style.display = "block";
  setTimeout(carousel, 6000);
}

var audio = new Audio("/assets/champions.mp3");
audio.play();
