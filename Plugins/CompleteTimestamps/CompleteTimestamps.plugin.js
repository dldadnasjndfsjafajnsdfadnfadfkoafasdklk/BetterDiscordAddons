//META{"name":"CompleteTimestamps","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/CompleteTimestamps","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/CompleteTimestamps/CompleteTimestamps.plugin.js"}*//

class CompleteTimestamps {
	getName () {return "CompleteTimestamps";}

	getVersion () {return "1.3.0";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Replace all timestamps with complete timestamps.";}

	initConstructor () {
		this.changelog = {
			"fixed":[["Chat Timestamps","The plugin now properly checking the option whether chat timestamps should be changed or not"]]
		};
		
		this.patchModules = {
			"MessageGroup":["componentDidMount","componentDidUpdate"],
			"StandardSidebarView":"componentWillUnmount"
		};

		this.languages;

		this.defaults = {
			settings: {
				showInChat:		{value:true, 	description:"Replace Chat Timestamp with Complete Timestamp:"},
				showOnHover:	{value:false, 	description:"Also show Timestamp when you hover over a message:"},
				changeForEdit:	{value:false, 	description:"Change the Time for the Edited Time Tooltips:"},
				displayTime:	{value:true, 	description:"Display the Time in the Timestamp:"},
				displayDate:	{value:true, 	description:"Display the Date in the Timestamp:"},
				cutSeconds:		{value:false, 	description:"Cut off Seconds of the Time:"},
				forceZeros:		{value:false, 	description:"Force leading Zeros:"},
				otherOrder:		{value:false, 	description:"Show the Time before the Date:"}
			},
			choices: {
				creationDateLang:		{value:"$discord", 	description:"Timestamp Format:"}
			},
			formats: {
				ownFormat:				{value:"$hour:$minute:$second, $day.$month.$year", 	description:"Own Format:"}
			}
		};
	}

	getSettingsPanel () {
		if (!global.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
		let settings = BDFDB.getAllData(this, "settings");
		let choices = BDFDB.getAllData(this, "choices");
		let formats = BDFDB.getAllData(this, "formats");
		let settingshtml = `<div class="${this.name}-settings DevilBro-settings"><div class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.size18 + BDFDB.disCNS.height24 + BDFDB.disCNS.weightnormal + BDFDB.disCN.marginbottom8}">${this.name}</div><div class="DevilBro-settings-inner">`;
		for (let key in settings) {
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="settings ${key}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} settings-switch"${settings[key] ? " checked" : ""}></div></div>`;
		}
		for (let key in choices) {
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCN.flexchild}" style="flex: 0 0 30%;">${this.defaults.choices[key].description}</h3><div class="${BDFDB.disCN.selectwrap}" style="flex: 1 1 70%;"><div class="${BDFDB.disCNS.select + BDFDB.disCNS.selectsingle + BDFDB.disCN.selecthasvalue}" option="${key}" value="${choices[key]}"><div class="${BDFDB.disCN.selectcontrol}"><div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignbaseline + BDFDB.disCNS.nowrap + BDFDB.disCN.selectvalue}" style="flex: 1 1 auto;"><div class="${BDFDB.disCNS.title + BDFDB.disCNS.medium + BDFDB.disCNS.size16 + BDFDB.disCNS.height20 + BDFDB.disCNS.primary + BDFDB.disCN.weightnormal} languageName" style="flex: 1 1 42%; padding:0;">${this.languages[choices[key]].name}</div><div class="${BDFDB.disCNS.title + BDFDB.disCNS.medium + BDFDB.disCNS.size16 + BDFDB.disCNS.height20 + BDFDB.disCNS.primary + BDFDB.disCN.weightnormal} languageTimestamp" style="flex: 1 1 58%; padding:0;">${this.getTimestamp(this.languages[choices[key]].id)}</div></div><span class="${BDFDB.disCN.selectarrowzone}"><span class="${BDFDB.disCN.selectarrow}"></span></span></div></div></div></div>`;
		}
		for (let key in formats) {
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCN.flexchild}" style="flex: 0 0 30%;">${this.defaults.formats[key].description}</h3><div class="${BDFDB.disCNS.inputwrapper + BDFDB.disCNS.vertical + BDFDB.disCNS.flex + BDFDB.disCN.directioncolumn}" style="flex: 1 1 auto;"><input type="text" option="${key}" value="${formats[key]}" placeholder="${this.defaults.formats[key].value}" class="${BDFDB.disCNS.inputdefault + BDFDB.disCNS.input + BDFDB.disCN.size16}"></div></div>`;
		}
		let infoHidden = BDFDB.loadData("hideInfo", this, "hideInfo");
		settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCNS.cursorpointer + (infoHidden ? BDFDB.disCN.categorywrappercollapsed : BDFDB.disCN.categorywrapperdefault)} toggle-info" style="flex: 1 1 auto;"><svg class="${BDFDB.disCNS.categoryicontransition + BDFDB.disCNS.directionright + (infoHidden ? BDFDB.disCN.categoryiconcollapsed : BDFDB.disCN.categoryicondefault)}" width="12" height="12" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M7 10L12 15 17 10"></path></svg><div class="${BDFDB.disCNS.categorycolortransition + BDFDB.disCNS.categoryoverflowellipsis + BDFDB.disCN.categorynamecollapsed}" style="flex: 1 1 auto;">Information</div></div>`;
		settingshtml += `<div class="DevilBro-settings-inner-list info-container" ${infoHidden ? "style='display:none;'" : ""}>`;
		settingshtml += `<div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">$hour will be replaced with the current hour</div><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">$minute will be replaced with the current minutes</div><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">$second will be replaced with the current seconds</div><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">$msecond will be replaced with the current milliseconds</div><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">$timemode will change $hour to a 12h format and will be replaced with AM/PM</div><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">$year will be replaced with the current year</div><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">$month will be replaced with the current month</div><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">$day will be replaced with the current day</div><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">$monthnameL will be replaced with the monthname in long format based on the Discord Language</div><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">$monthnameS will be replaced with the monthname in short format based on the Discord Language</div><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">$weekdayL will be replaced with the weekday in long format based on the Discord Language</div><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">$weekdayS will be replaced with the weekday in short format based on the Discord Language</div>`;
		settingshtml += `</div></div>`;

		let settingspanel = BDFDB.htmlToElement(settingshtml);

		BDFDB.initElements(settingspanel, this);

		BDFDB.addEventListener(this, settingspanel, "click", ".settings-switch", () => {this.updateSettingsPanel(settingspanel);});
		BDFDB.addEventListener(this, settingspanel, "keyup", BDFDB.dotCN.input, () => {this.saveInputs(settingspanel);});
		BDFDB.addEventListener(this, settingspanel, "click", BDFDB.dotCN.selectcontrol, e => {this.openDropdownMenu(e);});
		BDFDB.addEventListener(this, settingspanel, "click", ".toggle-info", e => {this.toggleInfo(e.currentTarget);});
		return settingspanel;
	}


	//legacy
	load () {}

	start () {
		if (!global.BDFDB) global.BDFDB = {myPlugins:{}};
		if (global.BDFDB && global.BDFDB.myPlugins && typeof global.BDFDB.myPlugins == "object") global.BDFDB.myPlugins[this.getName()] = this;
		var libraryScript = document.querySelector('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js"]');
		if (!libraryScript || performance.now() - libraryScript.getAttribute("date") > 600000) {
			if (libraryScript) libraryScript.remove();
			libraryScript = document.createElement("script");
			libraryScript.setAttribute("type", "text/javascript");
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js");
			libraryScript.setAttribute("date", performance.now());
			libraryScript.addEventListener("load", () => {if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();});
			document.head.appendChild(libraryScript);
		}
		else if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();
		this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
	}

	initialize () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			if (this.started) return;
			BDFDB.loadMessage(this);

			this.languages = Object.assign({"own":{name:"Own",id:"own",integrated:false,dic:false}},BDFDB.languages);

			BDFDB.addEventListener(this, document, "mouseenter", BDFDB.dotCNS.message + BDFDB.dotCN.messagecontent, e => {
				if (BDFDB.getData("showOnHover", this, "settings")) {
					let message = e.currentTarget;
					let messagegroup = BDFDB.getParentEle(BDFDB.dotCN.messagegroup, message);
					if (!messagegroup || !messagegroup.tagName) return;
					let info = this.getMessageData(message, messagegroup);
					if (!info || !info.timestamp || !info.timestamp._i) return;
					let choice = BDFDB.getData("creationDateLang", this, "choices");
					BDFDB.createTooltip(this.getTimestamp(this.languages[choice].id, info.timestamp._i), message, {type:"left",selector:"completetimestamp-tooltip"});
				}
			});
			BDFDB.addEventListener(this, document, "mouseenter", BDFDB.dotCNS.message + BDFDB.dotCN.messageedited, e => {
				if (BDFDB.getData("changeForEdit", this, "settings")) {
					let marker = e.currentTarget;
					let time = marker.getAttribute("datetime");
					if (!time) return;
					let choice = BDFDB.getData("creationDateLang", this, "choices");
					BDFDB.createTooltip(this.getTimestamp(this.languages[choice].id, time), marker, {type:"top",selector:"completetimestampedit-tooltip",css:`body ${BDFDB.dotCN.tooltip}:not(.completetimestampedit-tooltip) {display: none !important;}`});
				}
			});

			BDFDB.WebModules.forceAllUpdates(this);
		}
		else {
			console.error(`%c[${this.name}]%c`, 'color: #3a71c1; font-weight: 700;', '', 'Fatal Error: Could not load BD functions!');
		}
	}


	stop () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			BDFDB.removeEles(".complete-timestamp-divider");
			BDFDB.removeClasses("complete-timestamp");

			BDFDB.removeLocalStyle(this.name + "CompactCorrection");

			BDFDB.unloadMessage(this);
		}
	}


	// begin of own functions

	saveInputs (settingspanel) {
		let formats = {};
		for (let input of settingspanel.querySelectorAll(BDFDB.dotCN.input)) {
			formats[input.getAttribute("option")] = input.value;
		}
		BDFDB.saveAllData(formats, this, "formats");
		this.updateSettingsPanel(settingspanel);
	}

	updateSettingsPanel (settingspanel) {
		let choices = BDFDB.getAllData(this, "choices");
		for (let key in choices) {
			settingspanel.querySelector(`${BDFDB.dotCN.select}[option='${key}'] .languageTimestamp`).innerText = this.getTimestamp(this.languages[choices[key]].id);
		}
		this.SettingsUpdated = true;
	}

	toggleInfo (ele) {
		BDFDB.toggleClass(ele, BDFDB.disCN.categorywrappercollapsed);
		BDFDB.toggleClass(ele, BDFDB.disCN.categorywrapperdefault);
		var svg = ele.querySelector(BDFDB.dotCN.categoryicontransition);
		BDFDB.toggleClass(svg, BDFDB.disCN.directionright);
		BDFDB.toggleClass(svg, BDFDB.disCN.categoryiconcollapsed);
		BDFDB.toggleClass(svg, BDFDB.disCN.categoryicondefault);

		BDFDB.toggleEles(ele.nextElementSibling);
		BDFDB.saveData("hideInfo", BDFDB.isEleHidden(ele.nextElementSibling), this, "hideInfo");
	}

	openDropdownMenu (e) {
		let selectControl = e.currentTarget;
		let selectWrap = selectControl.parentElement;
		let plugincard = BDFDB.getParentEle("li", selectWrap);

		if (!plugincard || BDFDB.containsClass(selectWrap, BDFDB.disCN.selectisopen)) return;

		BDFDB.addClass(selectWrap, BDFDB.disCN.selectisopen);
		plugincard.style.setProperty("overflow", "visible", "important");

		let selectMenu = this.createDropdownMenu(selectWrap.getAttribute("value"));
		selectWrap.appendChild(selectMenu);

		BDFDB.addChildEventListener(selectMenu, "mousedown", BDFDB.dotCN.selectoption, e2 => {
			let language = e2.currentTarget.getAttribute("value");
			selectWrap.setAttribute("value", language);
			selectControl.querySelector(".languageName").innerText = this.languages[language].name;
			selectControl.querySelector(".languageTimestamp").innerText = this.getTimestamp(this.languages[language].id);
			BDFDB.saveData(selectWrap.getAttribute("option"), language, this, "choices");
		});

		var removeMenu = e2 => {
			if (e2.target.parentElement != selectMenu) {
				document.removeEventListener("mousedown", removeMenu);
				selectMenu.remove();
				plugincard.style.removeProperty("overflow");
				setTimeout(() => {BDFDB.removeClass(selectWrap, BDFDB.disCN.selectisopen);},100);
			}
		};

		document.addEventListener("mousedown", removeMenu);
	}

	createDropdownMenu (choice) {
		let menuhtml = `<div class="${BDFDB.disCN.selectmenuouter}"><div class="${BDFDB.disCN.selectmenu}">`;
		for (let key in this.languages) {
			let isSelected = key == choice ? ` ${BDFDB.disCN.selectselected}` : ``;
			menuhtml += `<div value="${key}" class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignbaseline + BDFDB.disCNS.nowrap + BDFDB.disCN.selectoption + isSelected}" style="flex: 1 1 auto; display:flex;"><div class="${BDFDB.disCNS.title + BDFDB.disCNS.medium + BDFDB.disCNS.size16 + BDFDB.disCNS.height20 + BDFDB.disCNS.primary + BDFDB.disCN.weightnormal}" style="flex: 1 1 42%;">${this.languages[key].name}</div><div class="${BDFDB.disCNS.title + BDFDB.disCNS.medium + BDFDB.disCNS.size16 + BDFDB.disCNS.height20 + BDFDB.disCNS.primary + BDFDB.disCN.weightnormal}" style="flex: 1 1 58%;">${this.getTimestamp(this.languages[key].id)}</div></div>`
		}
		menuhtml += `</div></div>`;
		return BDFDB.htmlToElement(menuhtml);
	}

	processMessageGroup (instance, wrapper) {
		if (BDFDB.getData("showInChat", this, "settings")) for (let stamp of wrapper.querySelectorAll("time[datetime]")) this.changeTimestamp(stamp);
	}

	processStandardSidebarView (instance, wrapper) {
		if (this.SettingsUpdated) {
			delete this.SettingsUpdated;
			BDFDB.WebModules.forceAllUpdates(this);
		}
	}

	changeTimestamp (stamp) {
		if (!stamp.className || stamp.className.toLowerCase().indexOf("timestamp") == -1 || BDFDB.containsClass(stamp, "complete-timestamp")) return;
		let time = stamp.getAttribute("datetime");
		if (time) {
			this.setMaxWidth();
			BDFDB.addClass(stamp, "complete-timestamp");
			let stampdivider = document.createElement("span");
			stampdivider.className = "complete-timestamp-divider arabic-fix";
			stampdivider.style.setProperty("display", "inline", "important");
			stampdivider.style.setProperty("height", "0px", "important");
			stampdivider.style.setProperty("width", "0px", "important");
			stampdivider.style.setProperty("font-size", "0px", "important");
			stampdivider.innerText = "ARABIC FIX";
			stamp.parentElement.insertBefore(stampdivider, stamp);
			BDFDB.setInnerText(stamp, this.getTimestamp(this.languages[BDFDB.getData("creationDateLang", this, "choices")].id, time));
		}
	}

	getMessageData (div, messagegroup) {
		let pos = Array.from(messagegroup.querySelectorAll("." + div.className.replace(/ /g, "."))).indexOf(div);
		let instance = BDFDB.getReactInstance(messagegroup);
		if (!instance) return;
		let info = instance.return.stateNode.props.messages;
		return info && pos > -1 ? info[pos] : null;
	}

	getTimestamp (languageid, time) {
		let timeobj = time ? time : new Date();
		if (typeof time == "string") timeobj = new Date(time);
		if (timeobj.toString() == "Invalid Date") timeobj = new Date(parseInt(time));
		if (timeobj.toString() == "Invalid Date") return;
		let settings = BDFDB.getAllData(this, "settings"), timestring = "";
		if (languageid != "own") {
			let timestamp = [];
			if (settings.displayDate) 	timestamp.push(timeobj.toLocaleDateString(languageid));
			if (settings.displayTime) 	timestamp.push(settings.cutSeconds ? this.cutOffSeconds(timeobj.toLocaleTimeString(languageid)) : timeobj.toLocaleTimeString(languageid));
			if (settings.otherOrder)	timestamp.reverse();
			timestring = timestamp.length > 1 ? timestamp.join(", ") : (timestamp.length > 0 ? timestamp[0] : "");
			if (timestring && settings.forceZeros) timestring = this.addLeadingZeros(timestring);
		}
		else {
			let ownformat = BDFDB.getData("ownFormat", this, "formats");
			languageid = BDFDB.getDiscordLanguage().id;
			let hour = timeobj.getHours(), minute = timeobj.getMinutes(), second = timeobj.getSeconds(), msecond = timeobj.getMilliseconds(), day = timeobj.getDate(), month = timeobj.getMonth()+1, timemode = "";
			if (ownformat.indexOf("$timemode") > -1) {
				timemode = hour >= 12 ? "PM" : "AM";
				hour = hour % 12;
				hour = hour ? hour : 12;
			}
			timestring = ownformat
				.replace("$hour", settings.forceZeros && hour < 10 ? "0" + hour : hour)
				.replace("$minute", minute < 10 ? "0" + minute : minute)
				.replace("$second", second < 10 ? "0" + second : second)
				.replace("$msecond", msecond)
				.replace("$timemode", timemode)
				.replace("$weekdayL", timeobj.toLocaleDateString(languageid,{weekday: "long"}))
				.replace("$weekdayS", timeobj.toLocaleDateString(languageid,{weekday: "short"}))
				.replace("$monthnameL", timeobj.toLocaleDateString(languageid,{month: "long"}))
				.replace("$monthnameS", timeobj.toLocaleDateString(languageid,{month: "short"}))
				.replace("$day", settings.forceZeros && day < 10 ? "0" + day : day)
				.replace("$month", settings.forceZeros && month < 10 ? "0" + month : month)
				.replace("$year", timeobj.getFullYear());
		}
		return timestring;
	}

	cutOffSeconds (timestring) {
		return timestring.replace(/(.*):(.*):(.{2})(.*)/, "$1:$2$4");
	}

	addLeadingZeros (timestring) {
		let chararray = timestring.split("");
		let numreg = /[0-9]/;
		for (let i = 0; i < chararray.length; i++) {
			if (!numreg.test(chararray[i-1]) && numreg.test(chararray[i]) && !numreg.test(chararray[i+1])) chararray[i] = "0" + chararray[i];
		}

		return chararray.join("");
	}

	setMaxWidth () {
		if (this.currentMode != BDFDB.getDiscordMode()) {
			this.currentMode = BDFDB.getDiscordMode();
			let timestamp = document.querySelector(BDFDB.dotCN.messagetimestampcompact);
			if (timestamp) {
				let choice = BDFDB.getData("creationDateLang", this, "choices");
				let testtimestamp = BDFDB.htmlToElement(`<time class="${timestamp.className}" style="width: auto !important;">${this.getTimestamp(this.languages[choice].id, new Date(253402124399995))}</time>`);
				document.body.appendChild(testtimestamp);
				let width = BDFDB.getRects(testtimestamp).width + 5;
				testtimestamp.remove();
				BDFDB.appendLocalStyle(this.name + "CompactCorrection", `
					${BDFDB.dotCN.messagetimestampcompact} {
						width: ${width}px !important;
					}
					${BDFDB.dotCN.messagetimestampcompactismentioned} {
						width: ${width + 2}px !important;
					}
					${BDFDB.dotCN.messagemarkupiscompact} {
						margin-left: ${width}px !important;
						text-indent: -${width}px !important;
					}
					${BDFDB.dotCN.messageaccessorycompact} {
						padding-left: ${width}px !important;
					}
				`);
			}
			else BDFDB.removeLocalStyle(this.name + "CompactCorrection");
		}
	}
}
