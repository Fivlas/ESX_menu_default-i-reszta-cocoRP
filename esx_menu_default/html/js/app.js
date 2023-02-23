(function(){

	let MenuTpl =
		'<div id="menu_{{_namespace}}_{{_name}}" class="menu{{#align}} align-{{align}}{{/align}}">' +
			'<div class="head"><span>{{{title}}}</span></div>' +
				'<div class="menu-items">' + 
					'{{#elements}}' +
						'<div class="menu-item {{#selected}}selected{{/selected}}">' +
							'{{{label}}}{{#isSlider}} : &lt;{{{sliderLabel}}}&gt;{{/isSlider}}' +
						'</div>' +
					'{{/elements}}' +
				'</div>'+
			'</div>' +
		'</div>'
	;

	window.ESX_MENU       = {};
	ESX_MENU.ResourceName = 'esx_menu_default';
	ESX_MENU.opened       = {};
	ESX_MENU.focus        = [];
	ESX_MENU.pos          = {};

	ESX_MENU.open = function(namespace, name, data) {

		if (typeof ESX_MENU.opened[namespace] == 'undefined') {
			ESX_MENU.opened[namespace] = {};
		}

		if (typeof ESX_MENU.opened[namespace][name] != 'undefined') {
			ESX_MENU.close(namespace, name);
		}

		if (typeof ESX_MENU.pos[namespace] == 'undefined') {
			ESX_MENU.pos[namespace] = {};
		}

		for (let i=0; i<data.elements.length; i++) {
			if (typeof data.elements[i].type == 'undefined') {
				data.elements[i].type = 'default';
			}
		}

		data._index     = ESX_MENU.focus.length;
		data._namespace = namespace;
		data._name      = name;

		for (let i=0; i<data.elements.length; i++) {
			data.elements[i]._namespace = namespace;
			data.elements[i]._name      = name;
		}

		ESX_MENU.opened[namespace][name] = data;
		ESX_MENU.pos   [namespace][name] = 0;

		for (let i=0; i<data.elements.length; i++) {
			if (data.elements[i].selected) {
				ESX_MENU.pos[namespace][name] = i;
			} else {
				data.elements[i].selected = false;
			}
		}

		ESX_MENU.focus.push({
			namespace: namespace,
			name     : name
		});
		
		ESX_MENU.render();
		$('#menu_' + namespace + '_' + name).find('.menu-item.selected')[0].scrollIntoView(true);
	};

	ESX_MENU.close = function(namespace, name) {
		
		delete ESX_MENU.opened[namespace][name];

		for (let i=0; i<ESX_MENU.focus.length; i++) {
			if (ESX_MENU.focus[i].namespace == namespace && ESX_MENU.focus[i].name == name) {
				ESX_MENU.focus.splice(i, 1);
				break;
			}
		}

		ESX_MENU.render();

	};

	ESX_MENU.render = function() {

		let menuContainer       = document.getElementById('menus');
		let focused             = ESX_MENU.getFocused();
		menuContainer.innerHTML = '';

		$(menuContainer).hide();

		for (let namespace in ESX_MENU.opened) {
			for (let name in ESX_MENU.opened[namespace]) {

				let menuData = ESX_MENU.opened[namespace][name];
				let view     = JSON.parse(JSON.stringify(menuData));

				for (let i=0; i<menuData.elements.length; i++) {
					let element = view.elements[i];

					switch (element.type) {
						case 'default' : break;

						case 'slider' : {
							element.isSlider    = true;
							element.sliderLabel = (typeof element.options == 'undefined') ? element.value : element.options[element.value];

							break;
						}

						default : break;
					}

					if (i == ESX_MENU.pos[namespace][name]) {
						element.selected = true;
					}
				}

				let menu = $(Mustache.render(MenuTpl, view))[0];
				$(menu).hide();
				menuContainer.appendChild(menu);
			}
		}

		if (typeof focused != 'undefined') {
			$('#menu_' + focused.namespace + '_' + focused.name).show();
		}

		$(menuContainer).show();

	};

	ESX_MENU.submit = function(namespace, name, data) {
		$.post('http://' + ESX_MENU.ResourceName + '/menu_submit', JSON.stringify({
			_namespace: namespace,
			_name     : name,
			current   : data,
			elements  : ESX_MENU.opened[namespace][name].elements
		}));
	};

	ESX_MENU.cancel = function(namespace, name) {
		$.post('http://' + ESX_MENU.ResourceName + '/menu_cancel', JSON.stringify({
			_namespace: namespace,
			_name     : name
		}));
	};
	
	//tu tablica po jsie albo obiekt
	
	ESX_MENU.change = function(namespace, name, data) {
		$.post('http://' + ESX_MENU.ResourceName + '/menu_change', JSON.stringify({
			_namespace: namespace,
			_name     : name,
			current   : data,
			elements  : ESX_MENU.opened[namespace][name].elements
		}));
	};

	ESX_MENU.getFocused = function() {
		return ESX_MENU.focus[ESX_MENU.focus.length - 1];
	};
	
	
    let blockedClothes = {
        "tshirt_1":[5000], // Podkoszulek_1
        "torso_1":[5000], // Góra_1
        "decals_1":[5000], // Detale_1
        "pants_1":[5000], // Spodnie_1
        "shoes_1":[5000], // buty_1
        "mask_1":[5000], // maska_1
        "chain_1":[5000], // szyja_1
        "bproof_1":[5000], // kamizelka_1
        "helmet_1":[5000], // nakrycie-głowy_1
    }

	var chuj = false;

	window.onData = (data) => {

		switch (data.action) {

			case 'openMenu': {
				ESX_MENU.open(data.namespace, data.name, data.data);
				break;
			}

			case 'closeMenu': {
				ESX_MENU.close(data.namespace, data.name);
				break;
			}

			case 'controlPressed': {

				switch (data.control) {

					case 'ENTER': {
						let focused = ESX_MENU.getFocused();

						if (typeof focused != 'undefined') {
							let menu    = ESX_MENU.opened[focused.namespace][focused.name];
							let pos     = ESX_MENU.pos[focused.namespace][focused.name];
							let elem    = menu.elements[pos];

							if (menu.elements.length > 0) {
								ESX_MENU.submit(focused.namespace, focused.name, elem);
							}
						}

						break;
					}

					case 'BACKSPACE': {
						let focused = ESX_MENU.getFocused();

						if (typeof focused != 'undefined') {
							ESX_MENU.cancel(focused.namespace, focused.name);
						}

						break;
					}

					case 'TOP': {

						let focused = ESX_MENU.getFocused();

						if (typeof focused != 'undefined') {

							let menu = ESX_MENU.opened[focused.namespace][focused.name];
							let pos  = ESX_MENU.pos[focused.namespace][focused.name];

							if (pos > 0) {
								ESX_MENU.pos[focused.namespace][focused.name]--;
							} else {
								ESX_MENU.pos[focused.namespace][focused.name] = menu.elements.length - 1;
							}

							let elem = menu.elements[ESX_MENU.pos[focused.namespace][focused.name]];

							for (let i=0; i<menu.elements.length; i++) {
								if (i == ESX_MENU.pos[focused.namespace][focused.name]) {
									menu.elements[i].selected = true;
								} else {
									menu.elements[i].selected = false;
								}
							}

							ESX_MENU.change(focused.namespace, focused.name, elem);
							ESX_MENU.render();

							$('#menu_' + focused.namespace + '_' + focused.name).find('.menu-item.selected')[0].scrollIntoView();
						}

						break;

					}

					case 'DOWN' : {

						let focused = ESX_MENU.getFocused();

						if (typeof focused != 'undefined') {
							let menu   = ESX_MENU.opened[focused.namespace][focused.name];
							let pos    = ESX_MENU.pos[focused.namespace][focused.name];
							let length = menu.elements.length;

							if (pos < length - 1) {
								ESX_MENU.pos[focused.namespace][focused.name]++;
							} else {
								ESX_MENU.pos[focused.namespace][focused.name] = 0;
							}

							let elem = menu.elements[ESX_MENU.pos[focused.namespace][focused.name]];

							for (let i=0; i<menu.elements.length; i++) {
								if (i == ESX_MENU.pos[focused.namespace][focused.name]) {
									menu.elements[i].selected = true;
								} else {
									menu.elements[i].selected = false;
								}
							}

							ESX_MENU.change(focused.namespace, focused.name, elem);
							ESX_MENU.render();

							$('#menu_' + focused.namespace + '_' + focused.name).find('.menu-item.selected')[0].scrollIntoView();
						}

						break;
					}

					case 'LEFT' : {

						let focused = ESX_MENU.getFocused();

						if (typeof focused != 'undefined') {
							let menu = ESX_MENU.opened[focused.namespace][focused.name];
							let pos  = ESX_MENU.pos[focused.namespace][focused.name];
							let elem = menu.elements[pos];

							switch(elem.type) {
								case 'default': break;

								case 'slider': {
									let min = (typeof elem.min == 'undefined') ? 0 : elem.min;

									if (elem.value > min) {
										if(focused.name == 'clotheshop'){
											if(elem.name == 'tshirt_1'){
												$.each(blockedClothes.tshirt_1, function( numerdziwki, dziwka ) {
													if(dziwka==elem.value-1){
														elem.value = elem.value-40;
													}
													if(numerdziwki+1 == blockedClothes.tshirt_1.length){
														chuj = true;
													}
												});
												if(chuj){
													elem.value--;
													chuj = false;
												}
											}else if(elem.name == 'torso_1'){
												$.each(blockedClothes.torso_1, function( numerdziwki, dziwka ) {
													if(dziwka==elem.value-1){
														elem.value = elem.value-40;
													}
													if(numerdziwki+1 == blockedClothes.torso_1.length){
														chuj = true;
													}
												});
												if(chuj){
													elem.value--;
													chuj = false;
												}
											}else if(elem.name == 'decals_1'){
												$.each(blockedClothes.decals_1, function( numerdziwki, dziwka ) {
													if(dziwka==elem.value-1){
														elem.value = elem.value-10;
													}
													if(numerdziwki+1 == blockedClothes.decals_1.length){
														chuj = true;
													}
												});
												if(chuj){
													elem.value--;
													chuj = false;
												}
											}else if(elem.name == 'pants_1'){
												$.each(blockedClothes.pants_1, function( numerdziwki, dziwka ) {
													if(dziwka==elem.value-1){
														elem.value = elem.value-10;
													}
													if(numerdziwki+1 == blockedClothes.pants_1.length){
														chuj = true;
													}
												});
												if(chuj){
													elem.value--;
													chuj = false;
												}
											}else if(elem.name == 'mask_1'){
												$.each(blockedClothes.mask_1, function( numerdziwki, dziwka ) {
													if(dziwka==elem.value-1){
														elem.value = elem.value-10;
													}
													if(numerdziwki+1 == blockedClothes.mask_1.length){
														chuj = true;
													}
												});
												if(chuj){
													elem.value--;
													chuj = false;
												}
											}else if(elem.name == 'chain_1'){
												$.each(blockedClothes.chain_1, function( numerdziwki, dziwka ) {
													if(dziwka==elem.value-1){
														elem.value = elem.value-10;
													}
													if(numerdziwki+1 == blockedClothes.chain_1.length){
														chuj = true;
													}
												});
												if(chuj){
													elem.value--;
													chuj = false;
												}
											}else if(elem.name == 'helmet_1'){
												$.each(blockedClothes.helmet_1, function( numerdziwki, dziwka ) {
													if(dziwka==elem.value-1){
														elem.value = elem.value-10;
													}
													if(numerdziwki+1 == blockedClothes.helmet_1.length){
														chuj = true;
													}
												});
												if(chuj){
													elem.value--;
													chuj = false;
												}
											} else {
												elem.value--;
											}
										}else {
											elem.value--;
										}
										
										ESX_MENU.change(focused.namespace, focused.name, elem);
									}

									ESX_MENU.render();
									break;
								}

								default: break;
							}

							$('#menu_' + focused.namespace + '_' + focused.name).find('.menu-item.selected')[0].scrollIntoView();
						}

						break;
					}

					case 'RIGHT' : {

						let focused = ESX_MENU.getFocused();

						if (typeof focused != 'undefined') {
							let menu = ESX_MENU.opened[focused.namespace][focused.name];
							let pos  = ESX_MENU.pos[focused.namespace][focused.name];
							let elem = menu.elements[pos];


							switch(elem.type) {
								case 'default': break;

								case 'slider': {
									if (typeof elem.options != 'undefined' && elem.value < elem.options.length - 1) {
										elem.value++;
										ESX_MENU.change(focused.namespace, focused.name, elem);
									}

									if (typeof elem.max != 'undefined' && elem.value < elem.max) {

										if(focused.name == 'clotheshop'){
											if(elem.name == 'tshirt_1'){
												
												blockedClothes.tshirt_1.forEach((el) => {
													if(el==elem.value+1){
														elem.value++
													}
												})
											}else if(elem.name == 'torso_1'){
												blockedClothes.torso_1.forEach((el) => {
													if(el==elem.value+1){
														elem.value++
													}
												})
											}else if(elem.name == 'decals_1'){
												blockedClothes.decals_1.forEach((el) => {
													if(el==elem.value+1){
														elem.value++
													}
												})
											}else if(elem.name == 'pants_1'){
												blockedClothes.pants_1.forEach((el) => {
													if(el==elem.value+1){
														elem.value++
													}
												})
											}else if(elem.name == 'mask_1'){
												blockedClothes.mask_1.forEach((el) => {
													if(el==elem.value+1){
														elem.value++
													}
												})
											}else if(elem.name == 'chain_1'){
												blockedClothes.chain_1.forEach((el) => {
													if(el==elem.value+1){
														elem.value++
													}
												})
											}else if(elem.name == 'helmet_1'){
												blockedClothes.helmet_1.forEach((el) => {
													if(el==elem.value+1){
														elem.value++
													}
												})
											}
										}
										elem.value++;
										ESX_MENU.change(focused.namespace, focused.name, elem);
									}

									ESX_MENU.render();
									break;
								}

								default: break;
							}

							$('#menu_' + focused.namespace + '_' + focused.name).find('.menu-item.selected')[0].scrollIntoView();
						}

						break;
					}

					
					case 'LEFTMORE' : {

						let focused = ESX_MENU.getFocused();

						if (typeof focused != 'undefined') {
							let menu = ESX_MENU.opened[focused.namespace][focused.name];
							let pos  = ESX_MENU.pos[focused.namespace][focused.name];
							let elem = menu.elements[pos];

							switch(elem.type) {
								case 'default': break;

								case 'slider': {
									let min = (typeof elem.min == 'undefined') ? 0 : elem.min;

									if (elem.value-10 > min) {
										if(focused.name == 'clotheshop'){
											if(elem.name == 'tshirt_1'){
												blockedClothes.tshirt_1.forEach((el) => {
													if(el==elem.value-10){
														elem.value=elem.value-30;
													}
												})
											}else if(elem.name == 'torso_1'){
												blockedClothes.torso_1.forEach((el) => {
													if(el==elem.value-10){
														elem.value=elem.value-30;
													}
												})
											}else if(elem.name == 'decals_1'){
												blockedClothes.decals_1.forEach((el) => {
													if(el==elem.value-10){
														elem.value=elem.value-20;
													}
												})
											}else if(elem.name == 'pants_1'){
												blockedClothes.pants_1.forEach((el) => {
													if(el==elem.value-10){
														elem.value=elem.value-20;
													}
												})
											}else if(elem.name == 'mask_1'){
												blockedClothes.mask_1.forEach((el) => {
													if(el==elem.value-10){
														elem.value=elem.value-20;
													}
												})
											}else if(elem.name == 'chain_1'){
												blockedClothes.chain_1.forEach((el) => {
													if(el==elem.value-10){
														elem.value=elem.value-20;
													}
												})
											}else if(elem.name == 'helmet_1'){
												blockedClothes.helmet_1.forEach((el) => {
													if(el==elem.value-10){
														elem.value=elem.value-20;
													}
												})
											}
										}
										elem.value=elem.value-10;
										
										ESX_MENU.change(focused.namespace, focused.name, elem);
									}

									ESX_MENU.render();
									break;
								}

								default: break;
							}

							$('#menu_' + focused.namespace + '_' + focused.name).find('.menu-item.selected')[0].scrollIntoView();
						}

						break;
					}					
					
					case 'RIGHTMORE' : {

						let focused = ESX_MENU.getFocused();

						if (typeof focused != 'undefined') {
							let menu = ESX_MENU.opened[focused.namespace][focused.name];
							let pos  = ESX_MENU.pos[focused.namespace][focused.name];
							let elem = menu.elements[pos];

							switch(elem.type) {
								case 'default': break;

								case 'slider': {
									if (typeof elem.options != 'undefined' && elem.value+10 < elem.options.length - 1) {
										elem.value++;
										ESX_MENU.change(focused.namespace, focused.name, elem);
									}

									if (typeof elem.max != 'undefined' && elem.value+10 < elem.max) {
										if(focused.name == 'clotheshop'){
											if(elem.name == 'tshirt_1'){
												blockedClothes.tshirt_1.forEach((el) => {
													if(el==elem.value+10){
														elem.value=elem.value+10;		
													}
												})
											}else if(elem.name == 'torso_1'){
												blockedClothes.torso_1.forEach((el) => {
													if(el==elem.value+10){
														elem.value=elem.value+10;		
													}
												})
											}else if(elem.name == 'decals_1'){
												blockedClothes.decals_1.forEach((el) => {
													if(el==elem.value+10){
														elem.value=elem.value+10;		
													}
												})
											}else if(elem.name == 'pants_1'){
												blockedClothes.pants_1.forEach((el) => {
													if(el==elem.value+10){
														elem.value=elem.value+10;		
													}
												})
											}else if(elem.name == 'mask_1'){
												blockedClothes.mask_1.forEach((el) => {
													if(el==elem.value+10){
														elem.value=elem.value+10;		
													}
												})
											}else if(elem.name == 'chain_1'){
												blockedClothes.chain_1.forEach((el) => {
													if(el==elem.value+10){
														elem.value=elem.value+10;		
													}
												})
											}else if(elem.name == 'helmet_1'){
												blockedClothes.helmet_1.forEach((el) => {
													if(el==elem.value+10){
														elem.value=elem.value+10;
													}
												})
											}
										}
										elem.value=elem.value+10;
										ESX_MENU.change(focused.namespace, focused.name, elem);
									}

									ESX_MENU.render();
									break;
								}

								default: break;
							}

							$('#menu_' + focused.namespace + '_' + focused.name).find('.menu-item.selected')[0].scrollIntoView();
						}

						break;
					}				

					default : break;

				}

				break;
			}

		}

	};

	window.onload = function(e){
		window.addEventListener('message', (event) => {
			onData(event.data);
		});
	};

})();