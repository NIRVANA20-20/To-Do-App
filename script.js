
function addTask(taskText , done = false) {
      
    let input = document.getElementById("taskInput");
    let task = taskText || input.value;

    if (task !== ""){
        let ul = document.getElementById("taskList");
        let li = document.createElement("li");        
        li.textContent = task;
     
        /* create delete button*/

        let delBtn = document.createElement("button");
        delBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
        delBtn.style.background = "none";
        delBtn.style.border = "none";
        delBtn.style.marginLeft = "10px";
        delBtn.style.cursor = "pointer";
        delBtn.style.color = "red";
         
        delBtn.onclick = function(){
            ul.removeChild(li);
            updateLocalStorage();
        };
        
        /* create the checkmark button*/

        let checkmark = document.createElement("button");
        checkmark.textContent = "✅";
        checkmark.style.background = "none";
        checkmark.style.border = "none";
        checkmark.style.marginLeft = "10px";
        checkmark.style.cursor = "pointer";
        checkmark.style.color = "green";

        checkmark.onclick = function() {
            li.style.textDecoration = li.style.textDecoration === "line-through" ? "none" : "line-through";
            updateLocalStorage();
        }


        li.appendChild(checkmark)
        li.appendChild(delBtn)
        ul.appendChild(li);
        
        if (done) {
            li.style.textDecoration = "line-through";
          }

        input.value = "";
        updateLocalStorage();
    }else{
        alert("Please enter a task !!!!!!!!")
    }

}

function updateLocalStorage() {

    let ul = document.getElementById("taskList")
    let tasks = [];
     
    ul.querySelectorAll("li").forEach((li) => {
      
        tasks.push({
            text: li.firstChild.textContent,
            done: li.style.textDecoration === "line-through"
        })
    
    })

    localStorage.setItem("tasks",JSON.stringify(tasks));

}

window.onload = function () {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.forEach(function (taskText) {
      addTask(taskText.text , taskText.done);
    });
  };