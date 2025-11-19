 // ---------- SECTION NAVIGATION ----------
    function nextSection(current, next) {
      document.getElementById(current).classList.add("hidden");
      document.getElementById(next).classList.remove("hidden");
    }

    // ---------- ROOM 1 ----------
    const room1Answers = ["phone","isolation","control","unsafe"];
    function checkRoom1() {
      const selected = [...document.querySelectorAll("#room1 .checkbox:checked")].map(cb => cb.value);
      const result = document.getElementById("room1Result");
      if(selected.length === room1Answers.length && selected.every(v => room1Answers.includes(v))){
        result.textContent = "Correct! Enter the unlock code.";
        result.className = "mt-3 font-semibold text-green-400";
        document.getElementById("room1Unlock").classList.remove("hidden");
      } else {
        result.textContent = "Some answers are incorrect. Try again.";
        result.className = "mt-3 font-semibold text-red-400";
      }
    }

    function checkRoom1Code(){
      const code = document.getElementById("room1Code").value.trim().toUpperCase();
      const result = document.getElementById("room1CodeResult");
      if(code==="ALERT"){
        result.textContent = "Room Unlocked! Proceeding to Room 2...";
        result.className = "mt-3 font-semibold text-green-400";
        setTimeout(()=>nextSection("room1","room2"),1000);
      } else {
        result.textContent = "Incorrect code. Try again.";
        result.className = "mt-3 font-semibold text-red-400";
      }
    }

    // ---------- ROOM 2 ----------
    function checkRoom2(){
      const A = document.querySelector('input[name="paperA"]:checked')?.value;
      const B = document.querySelector('input[name="paperB"]:checked')?.value;
      const C = document.querySelector('input[name="paperC"]:checked')?.value;
      const result = document.getElementById("room2Result");
      if(A==="RA9262" && B==="SafeSpaces" && C==="Trafficking"){
        result.textContent = "Correct! Enter the unlock code.";
        result.className = "mt-3 font-semibold text-green-400";
        document.getElementById("room2Unlock").classList.remove("hidden");
      } else {
        result.textContent = "Incorrect. Try again.";
        result.className = "mt-3 font-semibold text-red-400";
      }
    }
    function checkRoom2Code(){
      const code = document.getElementById("room2Code").value.trim().toUpperCase();
      const result = document.getElementById("room2CodeResult");
      if(code==="VAWC"){
        result.textContent = "Room Unlocked! Proceeding to Room 3...";
        result.className = "mt-3 font-semibold text-green-400";
        setTimeout(()=>nextSection("room2","room3"),1000);
      } else {
        result.textContent = "Incorrect code. Try again.";
        result.className = "mt-3 font-semibold text-red-400";
      }
    }

    // ---------- ROOM 3 ----------
    function checkRoom3Code(){
      const code = document.getElementById("room3Code").value.trim().toUpperCase();
      const result = document.getElementById("room3Result");
      if(code==="SAFE"){
        result.textContent = "Correct! Proceeding to Room 4...";
        result.className = "mt-3 font-semibold text-green-400";
        setTimeout(()=>nextSection("room3","room4"),1000);
      } else {
        result.textContent = "Incorrect. Try again.";
        result.className = "mt-3 font-semibold text-red-400";
      }
    }

    // ---------- ROOM 4 ----------
    function checkRoom4Code(){
      const steps = [
        document.getElementById("step1").value,
        document.getElementById("step2").value,
        document.getElementById("step3").value,
        document.getElementById("step4").value
      ];
      const result = document.getElementById("room4Result");
      const correctOrder = ["VAWDesk","ProtectionOrder","WCPD","SocialWorker"];
      const code = document.getElementById("room4Code").value.trim();
      if(steps.every((v,i)=>v===correctOrder[i]) && code==="911"){
        result.textContent = "All correct! Final room unlocked.";
        result.className = "mt-3 font-semibold text-green-400";
        setTimeout(()=>nextSection("room4","final"),1000);
      } else {
        result.textContent = "Incorrect steps or code. Try again.";
        result.className = "mt-3 font-semibold text-red-400";
      }
    }