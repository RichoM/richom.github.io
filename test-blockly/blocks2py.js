
let BlocksToPy = (function () {

	class Context {
		constructor(xml, robotName) {
			this.xml = xml;
			this.robotName = robotName;
			this.path = [xml];
			this.builder = new Builder();
			this.imports = new Set();
			this.errors = [];
			this.setups = [];
			this.globals = new Set();
		}

		get topLevelBlocks() {
			return Array.from(this.xml.childNodes).filter(isTopLevel);
		}
		get undefinedGlobals() {
			let setupBlocks = this.topLevelBlocks.filter(isSetup);
			let definedGlobals = new Set(setupBlocks.flatMap(block => {
				return getStatements(block)
					.filter(each => "set_variable" == each.getAttribute("type"))
					.map(block => asIdentifier(XML.getChildNode(block, "variableName").innerText));
			}));
			return Array.from(this.globals).filter(g => !definedGlobals.has(g));
		}

		getGeneratedCode() {
			let sections = [];
			// sections.push("#RobotName: " + this.robotName);
			sections.push("from RobotRL import RobotRL");

			// IMPORTS
			{
				if (this.imports.size > 0) {
					sections.push(Array.from(this.imports).join("\n"));
				}
				sections.push("");
			}

			// CONSTANTS
			{
				sections.push(['robot = RobotRL()'].join("\n"));
				sections.push("");
			}

			// SETUPS
			{
				if (this.setups.length > 0) {
						sections.push(this.setups.join("\n\n"));
						sections.push("");
				}
			}

			// UNDEFINED GLOBALS
			{
				let globals = this.undefinedGlobals;
				if (globals.length > 0) {
					sections.push(globals.map(g => g + " = 0").join("\n"));
					sections.push("");
				}
			}

			// CODE
			{
				let code = this.builder.toString();
				if (code.length > 0) { sections.push(code);	}
			}

			return sections.join("\n");
		}

		findProcedureNamed(name) {
			let procBlocks = new Set(["proc_definition_0args", "proc_definition_1args", "proc_definition_2args", "proc_definition_3args"]);
			return this.topLevelBlocks
				.filter(b => procBlocks.has(b.getAttribute("type")))
				.find(b => asIdentifier(b.children["procName"].innerText) == name);
		}

		findFunctionNamed(name) {
			let procBlocks = new Set(["func_definition_0args", "func_definition_1args", "func_definition_2args", "func_definition_3args"])
			return this.topLevelBlocks
				.filter(b => procBlocks.has(b.getAttribute("type")))
				.find(b => asIdentifier(b.children["funcName"].innerText) == name);
		}

		registerError(block, msg) {
			this.errors.push({block: block.getAttribute("id"), msg: msg});
		}
		addSetup(setups) {
			let setup = setups.join("\n");
			if (this.setups.includes(setup)) return;
			this.setups.push(setup);
		}
		registerGlobal(variableName) {
			if (!this.isLocalDefined(variableName)) {
				this.globals.add(variableName);
			}
		}
		findGlobalsInside(block) {
			let variableBlocks = new Set(["set_variable", "increment_variable", "variable"]);
			let children = Array.from(block.getElementsByTagName("*"));
			let vars = children.filter(each => variableBlocks.has(each.getAttribute("type")));
			let names = vars.map(block => asIdentifier(XML.getChildNode(block, "variableName").innerText));
			return Array.from(new Set(names)).filter(n => !this.isLocalDefined(n));
		}

		/*
		 * NOTE(Richo): For now, the only blocks capable of declaring local variables
		 * are "declare_local_variable", "for", and the procedure definition blocks.
		 * Unfortunately, "declare_local_variable" works a little different than the
		 * rest so we need special code to traverse the xml tree.
		 */
		isLocalDefined(name) {
			/*
			 * For the "declare_local_variable" block we walk from the current block
			 * element up through its parent chain looking for this type of block
			 * and we check if it declares a variable with the specified name. If we
			 * find it then we don't have to keep looking, we just return true.
			 */
			{
				let currentElement = this.path[this.path.length - 1];
				while (currentElement != null) {
					if (currentElement.getAttribute("type") == "declare_local_variable") {
						let field = XML.getChildNode(currentElement, "variableName");
						if (field != undefined && field.innerText == name) {
							return true; // We found our variable declaration!
						}
					}
					currentElement = currentElement.parentElement;
				}
			}

			/*
			 * In the other cases, we just need to look at the this.path to find
			 * the desired block. So, we start by filtering the path and then we
			 * check if any of the blocks found define a variable with the specified
			 * name.
			 */
			{
				let interestingBlocks = {
					for: ["variableName"],
					proc_definition_1args: ["arg0"],
					proc_definition_2args: ["arg0", "arg1"],
					proc_definition_3args: ["arg0", "arg1", "arg2"],
					func_definition_1args: ["arg0"],
					func_definition_2args: ["arg0", "arg1"],
					func_definition_3args: ["arg0", "arg1", "arg2"]
				};
				let interestingTypes = new Set(Object.keys(interestingBlocks));
				let blocks = this.path.filter(b => interestingTypes.has(b.getAttribute("type")));
				if (blocks.some(function (b) {
					let fields = interestingBlocks[b.getAttribute("type")];
					return fields.some(function (f) {
						let field = XML.getChildNode(b, f);
						return field != undefined && field.innerText == name;
					});
				})) {
					return true; // We found our variable declaration!
				}
			}

			// If we got here, the variable is not declared yet...
			return false;
		}
	}

	class Builder {
		constructor() {
			this.content = [];
			this.indentationLevel = 0;
		}
		indent() {
			for (let i = 0; i < this.indentationLevel; i++) {
				this.append("    ");
			}
			return this;
		}
		append(str) {
			this.content.push(str);
			return this;
		}
		newline() {
			this.content.push("\n");
			return this;
		}
		incrementLevel(fn) {
			let level = 1;
			this.indentationLevel += level;
			fn();
			this.indentationLevel -= level;
			return this;
		}
		appendLine(str) {
			this.append(str);
			this.newline();
			return this;
		}
		appendLines(strs) {
			if (!Array.isArray(strs)) { strs = arguments; }
			for (let i = 0; i < strs.length; i++) {
				this.appendLine(strs[i]);
			}
			return this;
		}
		toString() {
			return this.content.join("");
		}
	}

	let pythonKeywords = ['False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue', 'def', 'del', 'elif', 'else', 'except', 'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield'];
	let invalidSelectors = new Set(pythonKeywords.concat(["robot"]));
	let topLevelBlocks = ["simulator_setup", "simulator_loop",
												"proc_definition_0args", "proc_definition_1args",
												"proc_definition_2args", "proc_definition_3args",
												"func_definition_0args", "func_definition_1args",
												"func_definition_2args", "func_definition_3args"];
	let dispatchTable =  {
		simulator_setup: function (block, ctx) {
			let stmts = getStatements(block, name);
			stmts.forEach(stmt => generateCodeFor(stmt, ctx));
			if (stmts.length > 0) { ctx.builder.newline(); }
		},
		simulator_loop: function (block, ctx) {
			ctx.builder.indent()
				.appendLine("while robot.step():")
				.incrementLevel(() => {
					generateCodeForStatements(block, ctx, "statements");
				});
			ctx.builder.newline();
		},
		move_motor: function (block, ctx) {
			let motorName = asIdentifier(XML.getChildNode(block, "motorName").innerText);
			if (motorName == "motorIzquierdo") {
				ctx.builder.indent().append("robot.setVI(");
			} else if (motorName == "motorDerecho") {
				ctx.builder.indent().append("robot.setVD(");
			} else {
				throw "Nombre de motor inválido '" + motorName + "'";
			}
			generateCodeForValue(block, ctx, "motorSpeed");
			ctx.builder.appendLine(")");
		},
		stop_motor: function (block, ctx) {
			let motorName = asIdentifier(XML.getChildNode(block, "motorName").innerText);
			if (motorName == "motorIzquierdo") {
				ctx.builder.indent().append("robot.stopI(");
			} else if (motorName == "motorDerecho") {
				ctx.builder.indent().append("robot.stopD(");
			} else {
				throw "Nombre de motor inválido '" + motorName + "'";
			}
			ctx.builder.appendLine(")");
		},
		motor_is_moving: function (block, ctx) {
			let motorName = asIdentifier(XML.getChildNode(block, "motorName").innerText);
			if (motorName == "motorIzquierdo") {
				ctx.builder.append("robot.isMovingI()");
			} else if (motorName == "motorDerecho") {
				ctx.builder.append("robot.isMovingD()");
			} else {
				throw "Nombre de motor inválido '" + motorName + "'";
			}
		},
		sonar_get_distance: function (block, ctx) {
			ctx.builder.append("robot.getDistance()");
		},
		floor_get_brightness: function (block, ctx) {
			ctx.builder.append("robot.getBrightness()");
		},
		print: function (block, ctx) {
			ctx.builder.indent().append("print(");
			generateCodeForValue(block, ctx, "value");
			ctx.builder.appendLine(")");
		},
		string_constant: function (block, ctx) {
			let value = XML.getChildNode(block, "value").innerText;
			ctx.builder.append('"' + value + '"');
		},
		string_concat: function (block, ctx) {
			function isString(name) {
				let stringBlocks = new Set(["string_constant", "string_concat"]);
				let type = XML.getLastChild(XML.getChildNode(block, name)).getAttribute("type");
				return stringBlocks.has(type);
			}

			if (isString("left")) {
				generateCodeForValue(block, ctx, "left");
			} else {
				ctx.builder.append("str(");
				generateCodeForValue(block, ctx, "left");
				ctx.builder.append(")");
			}

			ctx.builder.append(" + ");

			if (isString("right")) {
				generateCodeForValue(block, ctx, "right");
			} else {
				ctx.builder.append("str(");
				generateCodeForValue(block, ctx, "right");
				ctx.builder.append(")");
			}
		},
		forever: function (block, ctx) {
			ctx.builder.indent().appendLine("while true:")
				.incrementLevel(() => {
					generateCodeForStatements(block, ctx, "statements");
				});
		},
		for: function (block, ctx) {
			let variableName = asIdentifier(XML.getChildNode(block, "variableName").innerText);
			ctx.builder.indent().append("for ").append(variableName).append(" in range(");
			generateCodeForValue(block, ctx, "start");
			ctx.builder.append(", ");
			generateCodeForValue(block, ctx, "stop");
			ctx.builder.append(", ");
			generateCodeForValue(block, ctx, "step");
			ctx.builder.appendLine("):");
			ctx.builder.incrementLevel(() => {
				generateCodeForStatements(block, ctx, "statements");
			});
		},
		number: function (block, ctx) {
			let value = parseFloat(XML.getChildNode(block, "value").innerText);
			ctx.builder.append(value.toString());
		},
		variable: function (block, ctx) {
			let variableName = asIdentifier(XML.getChildNode(block, "variableName").innerText);
			ctx.builder.append(variableName);
			ctx.registerGlobal(variableName);
		},
		conditional_simple: function (block, ctx) {
			ctx.builder.indent().append("if ");
			generateCodeForValue(block, ctx, "condition");
			ctx.builder.appendLine(":")
				.incrementLevel(() => {
					generateCodeForStatements(block, ctx, "trueBranch");
				});
		},
		conditional_full: function (block, ctx) {
			ctx.builder.indent().append("if ");
			generateCodeForValue(block, ctx, "condition");
			ctx.builder.appendLine(":")
				.incrementLevel(() => {
					generateCodeForStatements(block, ctx, "trueBranch");
				});
			ctx.builder.indent().appendLine("else:")
				.incrementLevel(() => {
					generateCodeForStatements(block, ctx, "falseBranch");
				});
		},
		logical_compare: function (block, ctx) {
			let type = XML.getChildNode(block, "operator").innerText;
			let valid = ["==", "!=", "<", "<=", ">", ">="];
			if (!valid.includes(type)) {
				throw "Logical operator not found: '" + type + "'";
			}
			let selector = type;
			ctx.builder.append("(");
			generateCodeForValue(block, ctx, "left");
			ctx.builder.append(" " + selector + " ");
			generateCodeForValue(block, ctx, "right");
			ctx.builder.append(")");
		},
		logical_operation: function (block, ctx) {
			let type = XML.getChildNode(block, "operator").innerText;
			ctx.builder.append("(");
			generateCodeForValue(block, ctx, "left");
			if (type === "and") {
				ctx.builder.append(" and ");
			} else if (type === "or") {
				ctx.builder.append(" or ");
			} else {
				throw "Invalid logical operator found: '" + type + "'";
			}
			generateCodeForValue(block, ctx, "right");
			ctx.builder.append(")");
		},
		boolean: function (block, ctx) {
			let bool = XML.getChildNode(block, "value").innerText;
			ctx.builder.append(bool == "true" ? "True" : "False");
		},
		logical_not: function (block, ctx) {
			ctx.builder.append("not ");
			generateCodeForValue(block, ctx, "value");
		},
		number_property: function (block, ctx) {
			let type = XML.getChildNode(block, "property").innerText;
			let valid = ["even", "odd", "positive", "negative"];
			if (!valid.includes(type)) {
				throw "Math number property not found: '" + type + "'";
			}
			ctx.builder.append("(");
			generateCodeForValue(block, ctx, "value");
			if (type === "even") {
				ctx.builder.append(" % 2 == 0");
			} else if (type === "odd") {
				ctx.builder.append(" % 2 != 0");
			} else if (type === "positive") {
				ctx.builder.append(" >= 0");
			} else if (type === "negative") {
				ctx.builder.append(" < 0");
			}
			ctx.builder.append(")");
		},
		number_divisibility: function (block, ctx) {
			ctx.builder.append("(");
			generateCodeForValue(block, ctx, "left");
			ctx.builder.append(" % ");
			generateCodeForValue(block, ctx, "right");
			ctx.builder.append(" == 0");
			ctx.builder.append(")");
		},
		number_round: function (block, ctx) {
			let type = XML.getChildNode(block, "operator").innerText;
			let valid = ["round", "ceil", "floor"];
			if (!valid.includes(type)) {
				throw "Math round type not found: '" + type + "'";
			}
			if (type == "round") {
				ctx.builder.append("round(");
			} else if (type == "ceil") {
				ctx.builder.append("ceil(");
			} else if (type == "floor") {
				ctx.builder.append("floor(");
			}
			generateCodeForValue(block, ctx, "number");
			ctx.builder.append(")");

			if (type != "round") {
				ctx.imports.add("from math import *");
			}
		},
		number_operation: function (block, ctx) {
			let type = XML.getChildNode(block, "operator").innerText;
			let valid = ["sqrt", "abs", "negate", "ln", "log10", "exp", "pow10"];
			if (!valid.includes(type)) {
				throw "Math function not found: '" + type + "'";
			}

			let num = () => generateCodeForValue(block, ctx, "number");
			if (type === "sqrt") { // sqrt(num)
				ctx.builder.append("sqrt(")
				num();
				ctx.builder.append(")");
			} else if (type === "abs") { // fabs(num)
				ctx.builder.append("fabs(")
				num();
				ctx.builder.append(")");
			} else if (type === "negate") { // num * -1
				ctx.builder.append("(");
				num();
				ctx.builder.append("* -1)");
			} else if (type === "ln") { // log(num)
				ctx.builder.append("log(");
				num();
				ctx.builder.append(")");
			} else if (type === "log10") { // log10(num)
				ctx.builder.append("log10(");
				num();
				ctx.builder.append(")");
			} else if (type === "exp") { // exp(num)
				ctx.builder.append("exp(");
				num();
				ctx.builder.append(")");
			} else if (type === "pow10") { // pow(10, num)
				ctx.builder.append("pow(10, ");
				num();
				ctx.builder.append(")");
			}

			if (type != "negate") {
				ctx.imports.add("from math import *");
			}
		},
		number_trig: function (block, ctx) {
			let type = XML.getChildNode(block, "operator").innerText;
			let valid = ["sin", "cos", "tan", "asin", "acos", "atan"];
			if (!valid.includes(type)) {
				throw "Math trig function not found: '" + type + "'";
			}
			ctx.builder.append(type);
			ctx.builder.append("(");
			generateCodeForValue(block, ctx, "number");
			ctx.builder.append(")");
		},
		math_constant: function (block, ctx) {
			let id = XML.getId(block);
			let type = XML.getChildNode(block, "constant").innerText;
			let value;
			if (type === "PI") {
				value = Math.PI;
			} else if (type === "E") {
				value = Math.E;
			} else if (type === "GOLDEN_RATIO") {
				value = 1.61803398875;
			} else if (type === "SQRT2") {
				value = Math.SQRT2;
			} else if (type === "SQRT1_2") {
				value = Math.SQRT1_2;
			} else if (type === "INFINITY") {
				value = 'float("inf")';
			} else {
				throw "Math constant not found: '" + type + "'";
			}
			ctx.builder.append(value.toString());
		},
		math_arithmetic: function (block, ctx) {
			let id = XML.getId(block);
			let type = XML.getChildNode(block, "operator").innerText;
			let selector;
			if (type === "DIVIDE") {
				selector = " / ";
			} else if (type === "MULTIPLY") {
				selector = " * ";
			} else if (type === "MINUS") {
				selector = " - ";
			} else if (type === "ADD") {
				selector = " + ";
			} else if (type === "POWER") {
				selector = " ** ";
			} else {
				throw "Math arithmetic function not found: '" + type + "'";
			}

			ctx.builder.append("(");
			generateCodeForValue(block, ctx, "left");
			ctx.builder.append(selector);
			generateCodeForValue(block, ctx, "right");
			ctx.builder.append(")");
		},
		repeat: function (block, ctx) {
			let negated = XML.getChildNode(block, "negate").innerText === "true";
			ctx.builder.indent().append("while ");
			if (negated) { ctx.builder.append("not "); }
			generateCodeForValue(block, ctx, "condition");
			ctx.builder.appendLine(":");
			ctx.builder.incrementLevel(() => {
				generateCodeForStatements(block, ctx, "statements");
			});
		},
		wait: function (block, ctx) {
			let negated = XML.getChildNode(block, "negate").innerText === "true";
			ctx.builder.indent().append("while ");
			if (negated) { ctx.builder.append("not "); }
			generateCodeForValue(block, ctx, "condition");
			ctx.builder.appendLine(":")
				.incrementLevel(() => ctx.builder.indent().appendLine("robot.step()"));
		},
		delay: function (block, ctx) {
			let unit = XML.getChildNode(block, "unit").innerText;
			ctx.builder.indent().append("robot.esperar(");
			generateCodeForValue(block, ctx, "time");
			if (unit == "ms") {
				ctx.builder.append(" / 1000");
			} else if (unit == "m") {
				ctx.builder.append(" * 60");
			}
			ctx.builder.appendLine(")");
		},
		elapsed_time: function (block, ctx) {
			let unit = XML.getChildNode(block, "unit").innerText;
			if (unit == "ms") {
				ctx.builder.append("(robot.tiempoActual() * 1000)");
			} else if (unit == "s") {
				ctx.builder.append("robot.tiempoActual()");
			} else if (unit == "m") {
				ctx.builder.append("(robot.tiempoActual() / 60)");
			} else {
				throw "Unidad desconocida: '" + unit + "'";
			}
		},
		number_modulo: function (block, ctx) {
			ctx.builder.append("(");
			generateCodeForValue(block, ctx, "dividend");
			ctx.builder.append(" % ");
			generateCodeForValue(block, ctx, "divisor");
			ctx.builder.append(")");
		},
		set_variable: function (block, ctx) {
			let variableName = asIdentifier(XML.getChildNode(block, "variableName").innerText);
			ctx.builder.indent().append(variableName).append(" = ");
			generateCodeForValue(block, ctx, "value");
			ctx.builder.newline();

			ctx.registerGlobal(variableName);
		},
		increment_variable: function (block, ctx) {
			let variableName = asIdentifier(XML.getChildNode(block, "variableName").innerText);
			ctx.builder.indent().append(variableName).append(" = ").append(variableName).append(" + ");
			generateCodeForValue(block, ctx, "value");
			ctx.builder.newline();

			ctx.registerGlobal(variableName);
		},
		number_random_int: function (block, ctx) {
			ctx.builder.append("randint(");
			generateCodeForValue(block, ctx, "from");
			ctx.builder.append(", ");
			generateCodeForValue(block, ctx, "to");
			ctx.builder.append(")");

			ctx.imports.add("from random import *");
		},
		number_random_float: function (block, ctx) {
			ctx.builder.append("random()");

			ctx.imports.add("from random import *");
		},
		proc_definition_0args: function (block, ctx) {
			let name = asIdentifier(XML.getChildNode(block, "procName").innerText);
			ctx.builder.append("def ").append(name).appendLine("():");
			ctx.builder.incrementLevel(() => {
				handleGlobalsInsideScope(block, ctx);
				generateCodeForStatements(block, ctx, "statements");
			});
			ctx.builder.newline();
		},
		proc_definition_1args: function (block, ctx) {
			let name = asIdentifier(XML.getChildNode(block, "procName").innerText);
			let args = [asIdentifier(XML.getChildNode(block, "arg0").innerText)];

			ctx.builder.append("def ").append(name).append("(");
			args.forEach((arg, i) => {
				if (i > 0) { ctx.builder.append(", "); }
				ctx.builder.append(arg);
			})
			ctx.builder.appendLine("):");
			ctx.builder.incrementLevel(() => {
				handleGlobalsInsideScope(block, ctx);
				generateCodeForStatements(block, ctx, "statements");
			});
			ctx.builder.newline();
		},
		proc_definition_2args: function (block, ctx) {
			let name = asIdentifier(XML.getChildNode(block, "procName").innerText);
			let args = [asIdentifier(XML.getChildNode(block, "arg0").innerText),
									asIdentifier(XML.getChildNode(block, "arg1").innerText)];

			ctx.builder.append("def ").append(name).append("(");
			args.forEach((arg, i) => {
				if (i > 0) { ctx.builder.append(", "); }
				ctx.builder.append(arg);
			})
			ctx.builder.appendLine("):");
			ctx.builder.incrementLevel(() => {
				handleGlobalsInsideScope(block, ctx);
				generateCodeForStatements(block, ctx, "statements");
			});
			ctx.builder.newline();
		},
		proc_definition_3args: function (block, ctx) {
			let name = asIdentifier(XML.getChildNode(block, "procName").innerText);
			let args = [asIdentifier(XML.getChildNode(block, "arg0").innerText),
									asIdentifier(XML.getChildNode(block, "arg1").innerText),
									asIdentifier(XML.getChildNode(block, "arg2").innerText)];

			ctx.builder.append("def ").append(name).append("(");
			args.forEach((arg, i) => {
				if (i > 0) { ctx.builder.append(", "); }
				ctx.builder.append(arg);
			});
			ctx.builder.appendLine("):");
			ctx.builder.incrementLevel(() => {
				handleGlobalsInsideScope(block, ctx);
				generateCodeForStatements(block, ctx, "statements");
			});
			ctx.builder.newline();
		},
		proc_call_0args: function (block, ctx) {
			let procName = asIdentifier(XML.getChildNode(block, "procName").innerText);
			if (!ctx.findProcedureNamed(procName)) {
				throw "No se encontró un procedimiento llamado '" + procName + "'";
			}
			ctx.builder.indent().append(procName).appendLine("()");
		},
		proc_call_1args: function (block, ctx) {
			let procName = asIdentifier(XML.getChildNode(block, "procName").innerText);
			if (!ctx.findProcedureNamed(procName)) {
				throw "No se encontró un procedimiento llamado '" + procName + "'";
			}
			let args = ["arg0"];
			ctx.builder.indent().append(procName).append("(");
			args.forEach((arg, i) => {
				if (i > 0) { ctx.builder.append(", "); }
				generateCodeForValue(block, ctx, arg);
			})
			ctx.builder.appendLine(")");
		},
		proc_call_2args: function (block, ctx) {
			let procName = asIdentifier(XML.getChildNode(block, "procName").innerText);
			if (!ctx.findProcedureNamed(procName)) {
				throw "No se encontró un procedimiento llamado '" + procName + "'";
			}
			let args = ["arg0", "arg1"];
			ctx.builder.indent().append(procName).append("(");
			args.forEach((arg, i) => {
				if (i > 0) { ctx.builder.append(", "); }
				generateCodeForValue(block, ctx, arg);
			})
			ctx.builder.appendLine(")");
		},
		proc_call_3args: function (block, ctx) {
			let procName = asIdentifier(XML.getChildNode(block, "procName").innerText);
			if (!ctx.findProcedureNamed(procName)) {
				throw "No se encontró un procedimiento llamado '" + procName + "'";
			}
			let args = ["arg0", "arg1", "arg2"];
			ctx.builder.indent().append(procName).append("(");
			args.forEach((arg, i) => {
				if (i > 0) { ctx.builder.append(", "); }
				generateCodeForValue(block, ctx, arg);
			})
			ctx.builder.appendLine(")");
		},
		func_definition_0args: function (block, ctx) {
			let name = asIdentifier(XML.getChildNode(block, "funcName").innerText);
			ctx.builder.append("def ").append(name).appendLine("():");
			ctx.builder.incrementLevel(() => {
				handleGlobalsInsideScope(block, ctx);
				generateCodeForStatements(block, ctx, "statements");
			});
			ctx.builder.newline();
		},
		func_definition_1args: function (block, ctx) {
			let name = asIdentifier(XML.getChildNode(block, "funcName").innerText);
			let args = [asIdentifier(XML.getChildNode(block, "arg0").innerText)];

			ctx.builder.append("def ").append(name).append("(");
			args.forEach((arg, i) => {
				if (i > 0) { ctx.builder.append(", "); }
				ctx.builder.append(arg);
			})
			ctx.builder.appendLine("):");
			ctx.builder.incrementLevel(() => {
				handleGlobalsInsideScope(block, ctx);
				generateCodeForStatements(block, ctx, "statements");
			});
			ctx.builder.newline();
		},
		func_definition_2args: function (block, ctx) {
			let name = asIdentifier(XML.getChildNode(block, "funcName").innerText);
			let args = [asIdentifier(XML.getChildNode(block, "arg0").innerText),
									asIdentifier(XML.getChildNode(block, "arg1").innerText)];

			ctx.builder.append("def ").append(name).append("(");
			args.forEach((arg, i) => {
				if (i > 0) { ctx.builder.append(", "); }
				ctx.builder.append(arg);
			})
			ctx.builder.appendLine("):");
			ctx.builder.incrementLevel(() => {
				handleGlobalsInsideScope(block, ctx);
				generateCodeForStatements(block, ctx, "statements");
			});
			ctx.builder.newline();
		},
		func_definition_3args: function (block, ctx) {
			let name = asIdentifier(XML.getChildNode(block, "funcName").innerText);
			let args = [asIdentifier(XML.getChildNode(block, "arg0").innerText),
									asIdentifier(XML.getChildNode(block, "arg1").innerText),
									asIdentifier(XML.getChildNode(block, "arg2").innerText)];

			ctx.builder.append("def ").append(name).append("(");
			args.forEach((arg, i) => {
				if (i > 0) { ctx.builder.append(", "); }
				ctx.builder.append(arg);
			})
			ctx.builder.appendLine("):");
			ctx.builder.incrementLevel(() => {
				handleGlobalsInsideScope(block, ctx);
				generateCodeForStatements(block, ctx, "statements");
			});
			ctx.builder.newline();
		},
		func_call_0args: function (block, ctx) {
			let funcName = asIdentifier(XML.getChildNode(block, "funcName").innerText);
			if (!ctx.findFunctionNamed(funcName)) {
				throw "No se encontró una función llamada '" + funcName + "'";
			}
			ctx.builder.append(funcName).append("()");
		},
		func_call_1args: function (block, ctx) {
			let funcName = asIdentifier(XML.getChildNode(block, "funcName").innerText);
			if (!ctx.findFunctionNamed(funcName)) {
				throw "No se encontró una función llamada '" + funcName + "'";
			}
			let args = ["arg0"];
			ctx.builder.append(funcName).append("(");
			args.forEach((arg, i) => {
				if (i > 0) { ctx.builder.append(", "); }
				generateCodeForValue(block, ctx, arg);
			})
			ctx.builder.append(")");
		},
		func_call_2args: function (block, ctx) {
			let funcName = asIdentifier(XML.getChildNode(block, "funcName").innerText);
			if (!ctx.findFunctionNamed(funcName)) {
				throw "No se encontró una función llamada '" + funcName + "'";
			}
			let args = ["arg0", "arg1"];
			ctx.builder.append(funcName).append("(");
			args.forEach((arg, i) => {
				if (i > 0) { ctx.builder.append(", "); }
				generateCodeForValue(block, ctx, arg);
			})
			ctx.builder.append(")");
		},
		func_call_3args: function (block, ctx) {
			let funcName = asIdentifier(XML.getChildNode(block, "funcName").innerText);
			if (!ctx.findFunctionNamed(funcName)) {
				throw "No se encontró una función llamada '" + funcName + "'";
			}
			let args = ["arg0", "arg1", "arg2"];
			ctx.builder.append(funcName).append("(");
			args.forEach((arg, i) => {
				if (i > 0) { ctx.builder.append(", "); }
				generateCodeForValue(block, ctx, arg);
			})
			ctx.builder.append(")");
		},
		return: function (block, ctx) {
			if (ctx.path.find(b => ["simulator_setup", "simulator_loop"].includes(b.getAttribute("type")))) {
				throw "El bloque 'salir' es sólo válido dentro de una función o un procedimiento";
			}
			ctx.builder.indent().appendLine("return");
		},
		return_value: function (block, ctx) {
			if (ctx.path.find(b => ["simulator_setup", "simulator_loop"].includes(b.getAttribute("type")))) {
				throw "El bloque 'devolver' es sólo válido dentro de una función o un procedimiento";
			}
			ctx.builder.indent().append("return ");
			generateCodeForValue(block, ctx, "value");
			ctx.builder.newline();
		},
	};

	function asIdentifier(str) {
		// Replace invalid symbols with '_'
		let identifier = str.replace(/[^A-Za-z0-9_]/g, '_');

		// Add '_' prefix if first character is a digit
		if (identifier.match(/^\d/)) {
			identifier = "_" + identifier;
		}

		// Avoid collisions with invalid selectors
		while (invalidSelectors.has(identifier)) {
			identifier += "_";
		}

		return identifier;
	}

	function handleGlobalsInsideScope(block, ctx) {
		let globals = ctx.findGlobalsInside(block);
		if (globals.length > 0) {
			ctx.builder.indent().append("global ").appendLine(globals.join(", "));
		}
	}

	function generateCodeFor(block, ctx) {
		if (isDisabled(block)) return undefined;

		let type = block.getAttribute("type");
		let func = dispatchTable[type];
		if (func == undefined) {
			throw "CODEGEN ERROR: Type not found '" + type + "'";
		}
		try {
			ctx.path.push(block);
			func(block, ctx);
		}
		finally {
			ctx.path.pop();
		}
	}

	function generateCodeForValue(block, ctx, name) {
		let child = XML.getChildNode(block, name);
		if (child === undefined) return undefined;
		let valueBlock = block;
		try {
			valueBlock = XML.getLastChild(child);
			generateCodeFor(valueBlock, ctx);
		} catch (err) {
			ctx.registerError(valueBlock, err);
			ctx.builder.append("None");
			return undefined;
		}
	}

	function generateCodeForStatements(block, ctx, name) {
		let stmts = getStatements(block, name);
		let count = 0;
		stmts.forEach(stmt => {
			try {
				generateCodeFor(stmt, ctx);
				count++;
			} catch (err) {
				ctx.registerError(stmt, err);
			}
		});
		if (count == 0) {
			ctx.builder.indent().appendLine("pass");
		}
	}

	function getStatements(block, name) {
		let child = XML.getChildNode(block, name || "statements");
		let stmts = [];
		if (child !== undefined) {
			child.childNodes.forEach(function (each) {
				let next = each;
				do {
					stmts.push(next);
					next = getNextStatement(next);
				} while (next !== undefined);
			});
		}
		return stmts;
	}

	function getNextStatement(block) {
		let next = XML.getLastChild(block, child => child.tagName === "NEXT");
		if (next === undefined) { return next; }
		return next.childNodes[0];
	}

	function isTopLevel(block) {
		return topLevelBlocks.indexOf(block.getAttribute("type")) != -1;
	}

	function isDisabled(block) {
		return block.getAttribute("disabled") === "true";
	}

	function isLoop(block) {
		return block.getAttribute("type") === "simulator_loop";
	}

	function isSetup(block) {
		return block.getAttribute("type") === "simulator_setup";
	}

	function assertValidBlocks(blocks, ctx) {
		let loopBlocks = blocks.filter(isLoop).filter(b => !isDisabled(b));
		for (let i = 1; i < loopBlocks.length; i++) {
			ctx.registerError(loopBlocks[i], 'Más de un bloque "loop". Sólo el primer bloque se ejecutará.');
		}
	}

	function error(msg, errors, code) {
		errors = errors || [];
		return {summary: msg, errors: errors, code: code};
	}

	return {
		generate: function (xml, robotName) {
			let ctx = new Context(xml, robotName);

			let blocks = ctx.topLevelBlocks;
			assertValidBlocks(blocks, ctx);

			// NOTE(Richo): Loops should always be last
			blocks.sort((a, b) => {
				if (isLoop(b) && !isLoop(a)) return -1;
				if (isLoop(a) && !isLoop(b)) return 1;
				return 0;
			});

			blocks.forEach(function (block) {
				generateCodeFor(block, ctx);
			});

			if (ctx.errors.length > 0) {
				throw error("Se encontraron los siguientes errores:", ctx.errors, ctx.getGeneratedCode());
			}

			return ctx.getGeneratedCode();
		}
	}
})();
