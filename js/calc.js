console.clear();
window.onload = function () { 

  var Model = {
    expressionToEval: "",
    historyArray: [],
    mmry: "",
    result: 0,
    clipboard: "",
    currentIndex: 0,
    outputExp: "",
    outputDisplay: "",
    evaluateFunction: function(opt){
      if(!this.outputDisplay){
        this.outputExp = "Enter a valid expression";
        this.outputDisplay = "";
      } else {
        expToEval = this.outputDisplay;
        try {
          if (opt === 'Integral'){
            this.result = Algebrite.run('integral(' + expToEval + ')');
          } else if (opt === 'Derivative'){
            this.result = Algebrite.run('d(' + expToEval + ')');
          } else {
            if(/x|y/g.test(expToEval)){
              this.result = Algebrite.run(expToEval);
            } else{ 
              // number, BigNumber, Fraction
              var mathAPI = math.create({number: 'number'});
              this.result = mathAPI.eval(expToEval).toString();
            }
          }
          var resultObject = {};
          resultObject.expression = expToEval;
          resultObject.result = this.result;
          this.historyArray.push(resultObject);
          this.currentIndex = this.historyArray.length - 1;

          this.outputExp = this.historyArray[this.currentIndex].expression;
          this.outputDisplay = this.historyArray[this.currentIndex].result;
        } catch(e) {
          var resultObject = {};
          resultObject.expression = this.expressionToEval;
          resultObject.result = e;
          this.historyArray.push(resultObject);

          this.outputExp = this.historyArray[this.currentIndex].expToEval;
          this.outputDisplay = this.historyArray[this.currentIndex].e;
        }
      }
    },
    updateClipboard: function (value){

      this.clipboard = value;
    },
    pasteHandler: function(){

      this.outputDisplay += this.clipboard;
    },
    historyHandle: function(direction){
      switch (direction){
        case "Prev": 
            if(!this.historyArray.length || this.historyArray.length == 0){
              return
            }
            this.currentIndex = this.currentIndex > 0 ? this.currentIndex -= 1 : 0;
            this.outputExp = this.historyArray[this.currentIndex].expression;
            this.outputDisplay = this.historyArray[this.currentIndex].result;
            break;
        case "Next": 
            if(!this.historyArray.length || this.historyArray.length == 0){
              return
            }
            this.currentIndex = this.currentIndex < (this.historyArray.length - 1) ? this.currentIndex += 1 : this.historyArray.length - 1;
            this.outputExp = this.historyArray[this.currentIndex].expression;
            this.outputDisplay = this.historyArray[this.currentIndex].result;
            break;
            break;
        default: 
            alert('error');
      }
    },
    deleteHandle: function() {

      this.outputDisplay = this.outputDisplay.substring(0, this.outputDisplay.length - 1);
    },
    clearHandle: function() {
      this.outputExp = "";
      this.outputDisplay = "";
    },
    inputHandle: function(key) {
      
      this.outputDisplay += key;
    },
    memoryHandle: function(arg) {
      switch (arg){
        //case "m+":
        case "mc": 
            this.mmry = "";
            break;
        case "m+": 
            this.mmry += ' + ' + this.outputDisplay;
            break;
        case "m-": 
            this.mmry += ' - ' + this.outputDisplay;
            break;
        case "mr": 
            this.mmry = Algebrite.run(this.mmry)
            this.outputDisplay += this.mmry;
            break;
        default: 
            alert('error');
      }
    },
    userPasteHandle: function(data) {
      this.clipboard = data;
      this.outputDisplay += data;
    }
  };
  
  var View = {
    render: function(M) {
      //console.log(M);
      document.getElementById('EvalResult').value = M.outputExp;
      document.getElementById('UserInput').value =  M.outputDisplay;
    },
    init: function(C){  
      // Evaluation buttons
      document.getElementById('Eval').addEventListener("click", function(){C.evalHandler('Eval');}, false);
      document.getElementById('Derivative').addEventListener("click", function(){C.evalHandler('Derivative');}, false);
      document.getElementById('Integral').addEventListener("click", function(){C.evalHandler('Integral');}, false);
      // Input expression text area
      var userInput = document.getElementById('UserInput');
      userInput.addEventListener("click", function(event) {
          C.handleCopy(userInput);
      });
      // Output expression text area
      var evalResult = document.getElementById('EvalResult');
      evalResult.addEventListener("click", function(event) {
          C.handleCopy(evalResult);
      });
      // Copy output button
      var copyOp = document.getElementById('CopyOp');
      copyOp.addEventListener("click", function(event) {
        C.handleCopy(evalResult);
      });

      // Copy result button
      var copyResult = document.getElementById('CopyResult');
      copyResult.addEventListener("click", function(event) {
        C.handleCopy(userInput);
      });

      // Paste result button
      var pasteResult = document.getElementById('PasteResult');
      pasteResult.addEventListener("click", function(event) {
        //userInput.value += clipboard;
        C.handlePaste();
      });

      // Navigation Prev button
      document.getElementById('PrevButton').onclick = function(){
        C.handleHistory('Prev');
        
      }
      // Navigation Next button
      document.getElementById('NextButton').onclick = function(){
        C.handleHistory('Next');
      }
      // Delete button
      document.getElementById('Delete').onclick = function(){
        C.handleDelete();
      }  
      // Clear button
      document.getElementById('Clear').onclick = function(){
        C.handleClear();
      }

      // Digits buttons
      var digits = document.getElementsByClassName('digit');
      for (var i = 0; i < digits.length; ++i) {
        var item = digits[i].onclick = function() { 
          var selectedDigit = this.getAttribute('data-val');
          C.handleInput(selectedDigit);
        };  
      }

      // Non Digits buttons
      var cores = document.getElementsByClassName('core');
      for (var i = 0; i < cores.length; ++i) {
          var item = cores[i].onclick = function() { 
            var selectedCore = this.getAttribute('data-val');
            C.handleInput(selectedCore);
          };  
      }

      //Memory buttons
      var memory = document.getElementsByClassName('memory');
      for (var i = 0; i < memory.length; ++i) {
        var item = memory[i].onclick = function() { 
            var selectedMemory = this.getAttribute('data-val');
            C.handleMemory(selectedMemory);
          };  
      }

      //Window events
      //window.addEventListener('paste', C.handleUserPaste);
      window.addEventListener("paste", function(e) {
        var clipboardData, pastedData;

        // Stop data actually being pasted into div
        e.stopPropagation();
        e.preventDefault();

        // Get pasted data via clipboard API
        clipboardData = e.clipboardData || window.clipboardData;
        pastedData = clipboardData.getData('Text');
        C.handleUserPaste(pastedData);
      });
      // TODO: add pressed keys
      window.addEventListener("keydown", function(event) {
        if (event.keyCode == 13) {
          event.preventDefault();
          event.stopPropagation();
          document.getElementById("Eval").click();
        }
        if (event.keyCode == 8) {
          C.handleDelete();
        }
        if (event.keyCode == 46) {
          C.handleClear();
        }

      });
      window.addEventListener("keypress", function(event) {
        var keyIn = event.keyIdentifier ? parseInt(event.keyIdentifier.substr(2), 16) : event.keyCode; 
        var charIn = String.fromCharCode(keyIn);
        //console.log(keyIn);

        if (/[+|-|*|\/|.|^|%|!|(|)|,|<|>|1|2|3|4|5|6|7|8|9|x|y|e|i|\-]/g.test(charIn)) {
          C.handleInput(charIn);
        }

      });
    },
  };
  
  var Controller = {
    load: function() {
      //Model.evaluateFunction('Eval');
      View.init(this);
      View.render(Model);
    },
    evalHandler: function(opts){
      Model.evaluateFunction(opts);
      this.update();
    },
    update: function(){

      View.render(Model);
    },
    handleCopy: function(elem){
      // create hidden text element, if it doesn't already exist
      var targetId = "_hiddenCopyText_";
      var isInput = elem.tagName === "INPUT" || elem.tagName === "TEXTAREA";
      var origSelectionStart, origSelectionEnd;
      if (isInput) {
          // can just use the original source element for the selection and copy
          target = elem;
          origSelectionStart = elem.selectionStart;
          origSelectionEnd = elem.selectionEnd;
      } else {
          // must use a temporary form element for the selection and copy
          target = document.getElementById(targetId);
          if (!target) {
              var target = document.createElement("textarea");
              target.style.position = "absolute";
              target.style.left = "-9999px";
              target.style.top = "0";
              target.id = targetId;
              document.body.appendChild(target);
          }
          target.textContent = elem.textContent;
      }
      // select the content
      var currentFocus = document.activeElement;
      target.focus();
      target.setSelectionRange(0, target.value.length);

      // copy the selection
      var succeed;
      try {
          succeed = document.execCommand("copy");
      } catch(e) {
          succeed = false;
      }
      // restore original focus
      if (currentFocus && typeof currentFocus.focus === "function") {
          currentFocus.focus();
      }

      if (isInput) {
          // restore prior selection
          elem.setSelectionRange(origSelectionStart, origSelectionEnd);
      } else {
          // clear temporary content
          target.textContent = "";
      }
      Model.updateClipboard(elem.value);
      return succeed;
    },
    handlePaste: function(){
      Model.pasteHandler(); 
      View.render(Model);
    },
    handleHistory: function(dir){
      Model.historyHandle(dir);
      View.render(Model);
    },
    handleDelete: function(){
      Model.deleteHandle();
      View.render(Model);
    },
    handleClear: function(){
      Model.clearHandle();
      View.render(Model);
    },
    handleInput: function(key){
      Model.inputHandle(key);
      View.render(Model);
    },
    handleMemory: function(arg) {
      Model.memoryHandle(arg);
      View.render(Model);
    },
    handleUserPaste: function(data) {
      Model.userPasteHandle(data);
      View.render(Model);
    }
  };
  
  Controller.load();
}