// JavaScript source code
document.addEventListener("DOMContentLoaded", async function () {
    let data = await fetch("../../Backend/creator.php");
    let json = await data.json();
    if (json.status === "creator") {
                document.getElementById("creatorMenu").style.display = "block";
                document.getElementById("notCreator").style.display = "none";
            } else {
                document.getElementById("creatorMenu").style.display = "none";
                document.getElementById("notCreator").style.display = "block";
    }
   
    });


