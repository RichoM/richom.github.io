const electron = require('electron');
const fs = require('fs');
const crypto = require('crypto');

class Output {
  constructor() {
    this.history = [];
    i18n.on("change", () => this.refresh());
  }

  clear() {
    $("#output-console").html("");
    this.history = [];
  }
  refresh() {
    let temp = this.history;
    this.clear();
    temp.forEach(entry => this.appendEntry(entry));
  }

  timestamp() {
    this.info((new Date()).toLocaleString());
  }

  exception(err) {
    let text = err["summary"];
    if (text) {
      this.appendEntry({type: "error", text: text});
      let errors = err["errors"];
      if (errors) {
        for (let i = 0; i < errors.length; i++) {
          this.appendEntry({type: "error", text: "[" + (i + 1) + "] " + errors[i]["msg"]});
        }
      }
    } else {
      this.appendEntry({type: "error", text: err.toString()});
    }
    this.newline();
  }

  newline() {
    this.appendEntry({type: "info", text: ""});
  }

  info(msg) {
    this.appendEntry({type: "info", text: msg});
  }
  success(msg) {
    this.appendEntry({type: "success", text: msg});
  }
  error(msg) {
    this.appendEntry({type: "error", text: msg});
  }
  appendEntry(entry) {
    // Remember the entry in case we need to update the panel (up to a fixed limit)
    if (this.history.length == 100) { this.history.shift(); }
    this.history.push(entry);

    // Translate and format the message
    let type = entry.type || "info";
    let args = entry.args || [];
    let regex = /%(\d+)/g;
    let text = i18n.translate(entry.text).replace(regex, function (m, i) {
      let arg = args[parseInt(i) - 1];
      return arg || m;
    });

    // Append element
    let css = {
      info: "text-dark",
      success: "text-success",
      error: "text-danger",
      warning: "text-warning"
    };
    let el = $("<div>").addClass("small").addClass(css[type]);
    if (text) { el.text(text); }
    else { el.html("&nbsp;"); }
    $("#output-console").append(el);

    // Scroll to bottom
    let panel = $("#output-panel").get(0);
    panel.scrollTop = panel.scrollHeight - panel.clientHeight;
  }
}

let IDE = (function () {

  let layout, defaultLayoutConfig;
  let codeEditor;
  let autorunInterval, autorunNextTime;
  let output;

  let userPorts = [];

  // HACK(Richo): To disable some controls while we're waiting for a connection
  let connecting = false;

  let IDE = {
    init: function () {
      // NOTE(Richo): The following tasks need to be done in order:
      loadDefaultLayoutConfig()
        .then(initializeDefaultLayout)
        .then(initializeTopBar)
        .then(initializeBlocksPanel)
        .then(initializeBlocklyVariablesModal)
        .then(initializeCodePanel)
        .then(initializeAutorun)
        .then(initializeOutputPanel)
        .then(initializeInternationalization)
        .then(() => i18n.currentLocale("es"));
    },
  };

  function loadDefaultLayoutConfig() {
    return new Promise(resolve => {
      /*
      NOTE(Richo): For some reason, when loading the editor as a webots window
      we can't fetch the json file for the default layout from the server.
      For that reason, I simply hardcoded the data here...
      */
      defaultLayoutConfig = {
        "settings": {
          "showPopoutIcon": false,
          "showMaximiseIcon": false,
          "showCloseIcon": false
        },
        "content": [{
          "type": "row",
          "content":[{
            "type": "component",
            "componentName": "DOM",
            "componentState": { "id": "#blocks-panel" },
            "title": "Blocks",
            "isClosable": false
          },{
            "type": "column",
            "width": 35,
            "content":[{
              "type": "component",
              "componentName": "DOM",
              "componentState": { "id": "#code-panel" },
              "title": "Code",
              "isClosable": false
            },{
              "type": "component",
              "height": 30,
              "componentName": "DOM",
              "componentState": { "id": "#output-panel" },
              "title": "Output",
              "isClosable": false
            }]
          }]
        }]
      };
      resolve();
    });
  }

  function initializeDefaultLayout() {
    initializeLayout(defaultLayoutConfig);
  }

  function initializeLayout(config) {
    if (layout) { layout.destroy(); }
    layout = new GoldenLayout(config, "#layout-container");
    layout.registerComponent('DOM', function(container, state) {
      let $el = $(state.id);
      container.getElement().append($el);
      container.on('destroy', function () {
        $("#hidden-panels").append($el);
      });
    });

    function updateSize() {
      let w = window.innerWidth;
      let h = window.innerHeight - $("#top-bar").outerHeight();
      if (layout.width != w || layout.height != h) {
        layout.updateSize(w, h);
      }
    };

    window.onresize = updateSize;
    layout.on('stateChanged', updateSize);
    layout.on('stateChanged', resizeBlockly);
    layout.on('stateChanged', saveToLocalStorage);
    layout.on('stateChanged', checkBrokenLayout);
    layout.on('stateChanged', function () {
      // HACK(Richo): The following allows me to translate panel titles
      $(".lm_title").each(function () { $(this).attr("lang", "en"); });
      i18n.updateUI();
    });
    layout.init();
    updateSize();
    resizeBlockly();
    checkBrokenLayout();
  }

  function readFile() {
    return new Promise((res, rej) => {
      let input = document.getElementById("open-file-input");
      input.onchange = function () {
        let file = input.files[0];
        input.value = null;
        if (file == undefined) return res(null);
  
        let reader = new FileReader();
        reader.onload = function(e) {
          res({
            name: file.name,
            contents: e.target.result
          })
        };
        reader.readAsText(file);
      };
      input.click();
    });
  }

  var $outputPath="roboliga.py";
  function initializeTopBar() {
    // if (!electron) {
    //   $("#new-button").attr("disabled", true);
    //   $("#open-button").attr("disabled", true);
    //   $("#save-button").attr("disabled", true);
    // } else {
      // const { dialog } = electron.remote;

      $("#new-button").on("click", function () {
        dialog.showSaveDialog({
          defaultPath: "roboliga.py",
          filters: [{name: "Python file", extensions: ["py"]}],
          properties: ["openFile"]
        }).then(function (response) {
          if (!response.canceled) {
            let path = response.filePath;
            $("#robot-name").val(getRobotNameFromPath(path));
            $("#output-path").val(path);
            UziBlock.getWorkspace().clear();
            saveToLocalStorage();
            scheduleAutorun();
          }
        });
      });

      $("#open-button").on("click", function () {
        readFile().then(file => {
          if (!file.name.endsWith(".py")) {
            alert("El archivo no es una definición de robot válida");
          } else {
            readBlocksFile(file.path);
          }
        });


            
        // dialog.showOpenDialog({
        //   filters: [{name: "Python file", extensions: ["py"]}],
        //   properties: ["openFile"]
        // }).then(function (response) {
        //   if (!response.canceled) {
        //     let path = response.filePaths[0];
        //     readBlocksFile(path).then(ok => {
        //       if (!ok) return;

        //       $("#output-path").val(path);
        //       saveToLocalStorage();
        //       scheduleAutorun();
        //     });
        //   }
        // });
      });

      $("#save-button").on("click", function () {
        
        var blob = new Blob(["Hello, world!"], {type: "text/plain;charset=utf-8"});
        var response = saveAs( blob, $outputPath);
        // dialog.showSaveDialog({
        //   defaultPath: "roboliga.py",
        //   filters: [{name: "Python file", extensions: ["py"]}],
        //   properties: ["openFile"]
        // }).then(function (response) {
        //   if (!response.canceled) {
        //     let path = response.filePath;
        //     $("#output-path").val(path);
        //     saveToLocalStorage();
        //     scheduleAutorun();
        //   }
        // })
      });
    // }

    $("#robot-name").on("input", function() {
      saveToLocalStorage();
      scheduleAutorun();
    });
  }

  function getRobotNameFromPath(path) {
    try {
      path = path.split('\\').pop().split('/').pop();
      let name = path.substr(0, path.lastIndexOf(".")).trim();
      return name;
    } catch {
      return "";
    }
  }

  function readBlocksFile(codePath) {

    let blocksPath = codePath.substr(0, codePath.lastIndexOf(".")) + ".blocks";
    return fs.promises.readFile(blocksPath)
      .then(contents => {
        let data = JSON.parse(contents);
        return fs.promises.readFile(codePath).then(src => {
          if (checksum(src) != data["checksum"]) {
            return electron.remote.dialog.showMessageBox({
              type: "warning",
              title: "¡Cuidado!",
              message: 'El archivo "' + codePath + '" ha sido modificado desde la última vez que lo abrió.\n\nSi continúa puede perder los cambios.\n¿Desea continuar?',
              buttons: ["yes", "no"]
            }).then(answer => {
              if (answer.response == 0) {
                if (data["robotName"]) { $("#robot-name").val(data["robotName"]); }
                UziBlock.setDataFromStorage(data);
                return true;
              } else {
                return false;
              }
            });
          }
          if (data["robotName"]) { $("#robot-name").val(data["robotName"]); }
          UziBlock.setDataFromStorage(data);
          return true;
        });
      }).catch(err => {
        if (err["code"] == "ENOENT") {
          return electron.remote.dialog.showMessageBox({
            type: "warning",
            title: "¡Cuidado!",
            message: 'No se encontró un archivo de bloques vinculado a "' + codePath + '".\n\n¿Desea continuar?',
            buttons: ["yes", "no"]
          }).then(answer => {
            if (answer.response == 0) {
              UziBlock.getWorkspace().clear();
              return true;
            } else {
              return false;
            }
          });
        } else {
          output.error(err.toString());
          return false;
        }
      });
  }

  // function readBlocksFile(codePath) {
  //   if (!fs || !electron) return Promise.resolve(false);

  //   let blocksPath = codePath.substr(0, codePath.lastIndexOf(".")) + ".blocks";
  //   return fs.promises.readFile(blocksPath)
  //     .then(contents => {
  //       let data = JSON.parse(contents);
  //       return fs.promises.readFile(codePath).then(src => {
  //         if (checksum(src) != data["checksum"]) {
  //           return electron.remote.dialog.showMessageBox({
  //             type: "warning",
  //             title: "¡Cuidado!",
  //             message: 'El archivo "' + codePath + '" ha sido modificado desde la última vez que lo abrió.\n\nSi continúa puede perder los cambios.\n¿Desea continuar?',
  //             buttons: ["yes", "no"]
  //           }).then(answer => {
  //             if (answer.response == 0) {
  //               if (data["robotName"]) { $("#robot-name").val(data["robotName"]); }
  //               UziBlock.setDataFromStorage(data);
  //               return true;
  //             } else {
  //               return false;
  //             }
  //           });
  //         }
  //         if (data["robotName"]) { $("#robot-name").val(data["robotName"]); }
  //         UziBlock.setDataFromStorage(data);
  //         return true;
  //       });
  //     }).catch(err => {
  //       if (err["code"] == "ENOENT") {
  //         return electron.remote.dialog.showMessageBox({
  //           type: "warning",
  //           title: "¡Cuidado!",
  //           message: 'No se encontró un archivo de bloques vinculado a "' + codePath + '".\n\n¿Desea continuar?',
  //           buttons: ["yes", "no"]
  //         }).then(answer => {
  //           if (answer.response == 0) {
  //             UziBlock.getWorkspace().clear();
  //             return true;
  //           } else {
  //             return false;
  //           }
  //         });
  //       } else {
  //         output.error(err.toString());
  //         return false;
  //       }
  //     });
  // }

  function initializeBlocksPanel() {
    return UziBlock.init()
      .then(function () {
        restoreFromLocalStorage();
        UziBlock.on("change", function () {
          saveToLocalStorage();
          scheduleAutorun();
        });
      });
  }


  function initializeBlocklyVariablesModal() {
    function getFormData() {
      let data = $("#blockly-variables-modal-container").serializeJSON();
      if (data.variables == undefined) return [];
      return Object.keys(data.variables).map(k => data.variables[k]);
    }

    function validateForm() {
      let inputs = $("#blockly-variables-modal").find("[name*='[name]']");
      inputs.each(function () { this.classList.remove("is-invalid"); });

      let valid = true;
      let regex = /^[a-zA-Z_][a-zA-Z_0-9]*$/;
      for (let i = 0; i < inputs.length; i++) {
        let input_i = inputs.get(i);

        // Check valid identifier
        if (!regex.test(input_i.value)) {
          input_i.classList.add("is-invalid");
          valid = false;
        }

        // Check for duplicates
        for (let j = i + 1; j < inputs.length; j++) {
          let input_j = inputs.get(j);

          if (input_i.value == input_j.value) {
            input_i.classList.add("is-invalid");
            input_j.classList.add("is-invalid");
            valid = false;
          }
        }
      }
      return valid;
    }

    function getDefaultVariable() {
      let data = getFormData();
      let variableNames = new Set(data.map(m  => m.name));
      let variable = {name: "variable"};
      let i = 1;
      while (variableNames.has(variable.name)) {
        variable.name = "variable" + i;
        i++;
      }
      return variable;
    }

    function appendVariableRow(i, variable, usedVariables) {

      function createTextInput(controlValue, controlName, validationFn) {
        let input = $("<input>")
          .attr("type", "text")
          .addClass("form-control")
          .addClass("text-center")
          .css("padding-right", "initial") // Fix for weird css alignment issue when is-invalid
          .attr("name", controlName);
        if (validationFn != undefined) {
          input.on("keyup", validationFn);
        }
        input.get(0).value = controlValue;
        return input;
      }
      function createRemoveButton(row) {
        let btn = $("<button>")
          .addClass("btn")
          .addClass("btn-sm")
          .attr("type", "button")
          .append($("<i>")
            .addClass("fas")
            .addClass("fa-minus"));

        if (usedVariables.has(variable.name)) {
          btn
            //.attr("disabled", "true")
            .addClass("btn-outline-secondary")
            .attr("data-toggle", "tooltip")
            .attr("data-placement", "left")
            .attr("title", i18n.translate("This variable is being used by the program!"))
            .on("click", function () {
              btn.tooltip("toggle");
            });
        } else {
          btn
            .addClass("btn-outline-danger")
            .on("click", function () { row.remove(); validateForm(); });
        }
        return btn;
      }
      let tr = $("<tr>")
        .append($("<input>").attr("type", "hidden").attr("name", "variables[" + i + "][index]").attr("value", i))
        .append($("<td>").append(createTextInput(variable.name, "variables[" + i + "][name]", validateForm)))
      tr.append($("<td>").append(createRemoveButton(tr)));
      $("#blockly-variables-modal-container-tbody").append(tr);
    }

    $("#add-variable-row-button").on("click", function () {
      let data = getFormData();
      let nextIndex = data.length == 0 ? 0: 1 + Math.max.apply(null, data.map(m => m.index));
      appendVariableRow(nextIndex, getDefaultVariable(), UziBlock.getUsedVariables());
    });

    UziBlock.getWorkspace().registerButtonCallback("configureVariables", function () {
      // Build modal UI
      $("#blockly-variables-modal-container-tbody").html("");
      let allVariables = UziBlock.getVariables();
      let usedVariables = UziBlock.getUsedVariables();
      if (allVariables.length == 0) {
        appendVariableRow(0, getDefaultVariable(), usedVariables);
      } else {
        allVariables.forEach(function (variable, i) {
          appendVariableRow(i, variable, usedVariables);
        });
      }
      $("#blockly-variables-modal").modal("show");
      validateForm();
    });

    $("#blockly-variables-modal").on("hide.bs.modal", function (evt) {
      if (!validateForm()) {
        evt.preventDefault();
        evt.stopImmediatePropagation();
        return;
      }

      let data = getFormData();
      UziBlock.setVariables(data);
      UziBlock.refreshToolbox();
      saveToLocalStorage();
    });

    $("#blockly-variables-modal-container").on("submit", function (e) {
      e.preventDefault();
      $("#blockly-variables-modal").modal("hide");
    });
  }

  function initializeCodePanel() {
		codeEditor = ace.edit("code-editor");
		codeEditor.setTheme("ace/theme/chrome");
		codeEditor.getSession().setMode("ace/mode/python");
    codeEditor.setReadOnly(true); // TODO(Richo): Only for now...
  }

  function initializeOutputPanel() {
    output = new Output();
  }

  function initializeAutorun() {
    const interval = 150;
    function loop() {
      autorun().finally(() => {
        setTimeout(loop, interval);
      });
    }
    setTimeout(loop, interval);
  }

  function getNavigatorLanguages() {
    if (navigator.languages && navigator.languages.length) {
      return navigator.languages;
    } else {
      return navigator.userLanguage || navigator.language || navigator.browserLanguage;
    }
  }

  function initializeInternationalization() {
    let navigatorLanguages = getNavigatorLanguages();
    let defaultLanguage    = "es";
    let preferredLanguage  = undefined;

    i18n.init(TRANSLATIONS);

    for (let i = 0; i < navigatorLanguages.length; i++) {
      let languageCode = navigatorLanguages[i];
      if (i18n.availableLocales.includes(languageCode)) {
        preferredLanguage = languageCode;
        break;
      }
    }

    i18n.currentLocale(preferredLanguage || defaultLanguage);
    $("#spinner-container").hide();
  }

  function initializeBrokenLayoutErrorModal() {
    $("#fix-broken-layout-button").on("click", function () {
      initializeDefaultLayout();
      $("#broken-layout-modal").modal("hide");
    });
  }

  function checkBrokenLayout() {
    if (layout.config.content.length > 0) return;

    setTimeout(function () {
      if (layout.config.content.length > 0) return;
      $("#broken-layout-modal").modal("show");
    }, 1000);
  }

  function resizeBlockly() {
    UziBlock.resizeWorkspace();
  }

	function restoreFromLocalStorage() {
    try {
      let ui = {
        robotName: localStorage["webots.robotName"] || "",
        outputPath: localStorage["webots.outputPath"] || "",
        //layout: JSON.parse(localStorage["webots.layout"] || "null"),
        blockly: JSON.parse(localStorage["webots.blockly"] || "null"),
      };
      setUIState(ui);
    } catch (err) {
      console.log(err);
    }
	}

  function saveToLocalStorage() {
    if (UziBlock.getWorkspace() == undefined || layout == undefined) return;

    let ui = getUIState();
    localStorage["webots.robotName"] = ui.robotName;
    localStorage["webots.outputPath"] = ui.outputPath;
    //localStorage["webots.layout"] = JSON.stringify(ui.layout);
    localStorage["webots.blockly"] = JSON.stringify(ui.blockly);
  }

  function getUIState() {
    return {
      robotName: $("#robot-name").val(),
      outputPath: $("#output-path").val(),
      layout: layout.toConfig(),
      blockly: UziBlock.getDataForStorage(),
    };
  }

  function setUIState(ui) {
    try {
      if (ui.robotName) {
        $("#robot-name").val(ui.robotName);
      }

      if (ui.layout) {
        initializeLayout(ui.layout);
      }

      if (ui.blockly) {
        UziBlock.setDataFromStorage(ui.blockly);
      }

      if (ui.outputPath && ui.outputPath.trim != "") {
        readBlocksFile(ui.outputPath).then(ok => {
          if (ok) {
            $("#output-path").val(ui.outputPath);
          } else {
            $("#output-path").val("");
            saveToLocalStorage();
          }
        });
      }
    } catch (err) {
      console.error(err);
    }
  }

	function scheduleAutorun() {
		let currentTime = +new Date();
		autorunNextTime = currentTime + 150;
	}

  function success() {
    $(document.body).css("border", "4px solid black");
  }

  function error() {
    $(document.body).css("border", "4px solid red");
  }

	function autorun() {
		if (autorunNextTime == undefined) return Promise.resolve();

		let currentTime = +new Date();
		if (currentTime < autorunNextTime) return Promise.resolve();
    autorunNextTime = undefined;

    output.clear();
    output.timestamp();
    output.newline();

    let src = "";
    try {
      let robotName = $("#robot-name").val();
  		src = UziBlock.getGeneratedCode(robotName);
      output.success("Compilación exitosa!");
    } catch (err) {
      src = err.code || "";
      output.exception(err);
    }

    if (codeEditor.getValue() !== src) {
      codeEditor.setValue(src, 1);
    }

    return writeToOutput(src, UziBlock.getDataForStorage());
	}

  function writeToOutput(src, blocks) {
    let codePath = $("#output-path").val();
    if (!fs || !codePath || codePath.trim() == "") {
      output.error("El archivo no se pudo escribir");
      return Promise.reject();
    }

    return fs.promises.writeFile(codePath, src).then(() => {
      let blocksPath = codePath.substr(0, codePath.lastIndexOf(".")) + ".blocks";
      blocks["robotName"] = $("#robot-name").val();
      blocks["checksum"] = checksum(src);
      return fs.promises.writeFile(blocksPath, JSON.stringify(blocks));
    }).then(() => {
      output.success("El archivo se escribió correctamente!");
    }).catch(err => {
      output.error(err.toString());
    });
  }

  function checksum(str, algorithm, encoding) {
    if (!crypto) return null;
    return crypto
      .createHash(algorithm || 'sha1')
      .update(str, 'utf8')
      .digest(encoding || 'hex')
  }

  return IDE;
})();
