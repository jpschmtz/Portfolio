jQuery(function() {
	initSmoothScroll();
	initObjectFitIE();
	initMobMenu();
	if(jQuery('.slider').length) {
		initSlider();
	}
	initContactPopup();
	initFocusInput();
	initTooltip();
	initAnimOnScroll();
	if (!is_touch_device()) {
		initParallax();
	}
	initAddClassTouch();
	initExpandBlock();
	initCustomForms();

    jQuery('.reset-form').on('click', function(e) {
      e.preventDefault();
      jQuery(this).parent().find('[type="reset"]').click();
      jQuery('p.focus').removeClass('focus');
    });

});


jQuery(window).on('scroll load', function() {
	initHeaderScroll();
})


jQuery(window).on('resize load', function() {
	if(jQuery('.slider').length) {
		initSlider();
	}
})

// initialize custom form elements
function initCustomForms() {
	jcf.replaceAll('.custom-form');
}

function initExpandBlock() {
	jQuery('.open-panel-label').on('click', function() {
		jQuery(this).addClass('active');
		jQuery(this).siblings('.expand-block').slideDown();
	})

	jQuery('.expand-block .drawer__close').on('click', function() {
		jQuery(this).parent().siblings('.open-panel-label').removeClass('active');
		jQuery(this).closest('.expand-block').slideUp();
	})
}

function is_touch_device() {
	return 'ontouchstart' in window
		|| 'onmsgesturechange' in window;
};

function initAddClassTouch() {
	if (is_touch_device()) {
		jQuery('html').addClass('touch')
	} else {
		jQuery('html').removeClass('touch')
	}
}

function initFocusInput() {
	const input = jQuery('.contact-form input').not(':input[type=submit]').add('textarea');

	input.on('blur', function(event) {
		const $this = jQuery(this);
		const value = event.target.value;
		value.length ? $this.closest('p').addClass('focus') : $this.closest('p').removeClass('focus');
	});

	input.on('focus', function(event) {
		const $this = jQuery(this);
		$this.closest('p').addClass('focus')
	});
}

function initContactPopup() {
	jQuery('.btn-item a').on('click', function(e) {
		e.preventDefault();

		jQuery(this).toggleClass('btn-close');
		if (jQuery(this).hasClass('btn-close')) {
			jQuery('body').addClass('open-form');
			if (jQuery('html').hasClass('active-m-menu')){
				jQuery('html').removeClass('active-m-menu');
				jQuery('#toggle').addClass('active');
			}
		} else {
			jQuery('body').removeClass('open-form');
		}
	});
}

function initTooltip() {
	jQuery('.item-tooltip').on('click', function() {
		let _this = jQuery(this);
		jQuery('.item-tooltip')
			.not(_this)
				.removeClass('active')
			.find('.tooltip-descr')
			.removeClass('active');

		const tooltipWidth = _this.find('.tooltip-descr').width();
		_this.removeClass('left-side');
		if (_this.offset().left + tooltipWidth >= jQuery(window).width() ) {
			_this.addClass('left-side');
		}

		_this.toggleClass('active');
		if (_this.hasClass('active')) {
			_this.find('.tooltip-descr').addClass('active')
		} else {
			_this.find('.tooltip-descr').removeClass('active')
		}
	});
}

function initAnimOnScroll() {
	const controller = new ScrollMagic.Controller();
	const fadeInAnim = jQuery('.fade-in-anim');

	controller.update(true);

	if (fadeInAnim.length) {

		if (window.matchMedia('(min-width: 1025px)').matches) {
			if (!controller.enabled()) {
				controller.enabled(true);
			}
			fadeInAnim.each(function() {
				let tween2 = TweenMax.fromTo(jQuery(this), 0.6, { alpha: 0, y: "60" }, { alpha: 1, y: "0"});
				new ScrollMagic.Scene({ triggerElement: this, triggerHook: '.85', reverse: false})
					.setTween(tween2)
					.addTo(controller);
			});
		} else {
			if (controller.enabled()) {
				controller.enabled(false);
			}
			TweenMax.set(fadeInAnim, { clearProps: "all" });
		}
	}
}

function initParallax() {
	const controller = new ScrollMagic.Controller();
	const scrollRowNote = jQuery('.note-item-row');
	const amountBox = jQuery('.box-amount');
	const featuresBox = jQuery('.path-row');
	const pathBox = jQuery('.path');
	const galleryItem = jQuery('.gal-item');

	controller.update(true);

	if (scrollRowNote.length || amountBox.length || pathBox.length || galleryItem.length) {

		if (window.matchMedia('(min-width: 1025px)').matches) {
			if (!controller.enabled()) {
				controller.enabled(true);
			}

			scrollRowNote.each(function() {
				let tween = TweenMax.to(jQuery(this).find('.note-item-img'), 0.8, { y: "-=100" });
				new ScrollMagic.Scene({ triggerElement: this, duration: '100%', triggerHook: '.8'})
					.setTween(tween)
					.addTo(controller);
			});

			amountBox.each(function() {
				let tween = TweenMax.to(jQuery(this), 0.6, {y: "-=50"});
				new ScrollMagic.Scene({ triggerElement: this, duration: '100%', triggerHook: '.7'})
					.setTween(tween)
					.addTo(controller);
			});

			featuresBox.each(function() {
				let tween = TweenMax.to(jQuery(this).find('.path-item-img'), 0.6, {y: "-=100"});
				new ScrollMagic.Scene({ triggerElement: this, duration: '100%', triggerHook: '.8'})
					.setTween(tween)
					.addTo(controller);
			});

      pathBox.each(function() {
				let tween = TweenMax.to(jQuery(this).find('.image_w_caption'), 0.6, {y: "-=100"});
				new ScrollMagic.Scene({ triggerElement: this, duration: '90%', triggerHook: '.8'})
					.setTween(tween)
					.addTo(controller);
			});

			galleryItem.each(function() {
				const tl = new TimelineLite();
				let tween = tl.staggerTo(jQuery(this).children('.holder'), 0.5, {
					y: "-=100",
					ease: Back.easeIn
				}, "+=10");

				new ScrollMagic.Scene({ triggerElement: this, duration: '100%', triggerHook: '.8'})
					.setTween(tween)
					.addTo(controller);
			});
		} else {
			if (controller.enabled()) {
				controller.enabled(false);
				jQuery('body').removeClass('active-parallax')
			}

			TweenMax.set(scrollRowNote.find('.note-item-img'), { clearProps: "all" });
			TweenMax.set(amountBox.find('.note-item-img'), { clearProps: "all" });
			TweenMax.set(featuresBox.find('.path-item-img'), { clearProps: "all" });
			TweenMax.set(pathBox.find('.image_w_caption'), { clearProps: "all" });
			TweenMax.set(galleryItem.children('.holder'), { clearProps: "all" });
		}
	}
}

function initHeaderScroll() {
	let header = jQuery('.header');
	let scrolltop = jQuery(window).scrollTop();
	const firstScreenHeight = jQuery('.hero-screen').outerHeight();

	if (firstScreenHeight) {
		if ( scrolltop > firstScreenHeight ) {
			header.addClass('active');
		} else {
			header.removeClass('active');
		}
	} else {
		header.addClass('active');
	}
}

function initSlider() {
	var time = 2;
	var $bar,
		$slick,
		isPause,
		tick,
		percentTime;

	jQuery('.category-slider-section').on({
		mouseenter: function () {
			isPause = true;
		},
		mouseleave: function () {
			isPause = false;
		}
	})

	function startProgressbar() {
		resetProgressbar();
		percentTime = 0;
		isPause = false;
		tick = setInterval(interval, 40);
	}

	function interval() {
		if (isPause === false) {
			percentTime += 1 / (time + 0.1);
			$bar.css({
				width: percentTime + "%"
			});
			if (percentTime >= 100) {
				$slick.slick('slickNext');
				startProgressbar();
			}
		}
	}

	function resetProgressbar() {
		$bar.css({
			width: 0 + '%'
		});
		clearTimeout(tick);
	}

	$slick = jQuery('.category-slider');
	$slick.not('.slick-initialized').slick({
		draggable: true,
		dots: false,
		pauseOnDotsHover: true,
		speed: 1300,
		responsive: [{
			breakpoint: 1025,
			settings: 'unslick'
		}],
	});

	$bar = jQuery('.slider-progress .progress');
	startProgressbar();
}

function initMobMenu() {
	jQuery('#toggle').on('click', function () {				
		if (jQuery('body').hasClass('open-form')){
			jQuery('body').removeClass('open-form');
			jQuery('html').addClass('active-m-menu');
			jQuery('.btn-item a').removeClass('btn-close');
		}
		else {
			jQuery(this).toggleClass('active');
			if (jQuery(this).hasClass('active')) {
				jQuery('html').addClass('active-m-menu');
			} else {
				jQuery('html').removeClass('active-m-menu');
			}
		}
	});

	jQuery('.main-nav ul.menu-main-navigation a').on('click', function () {
    jQuery('html').removeClass('active-m-menu');
    jQuery('#toggle').removeClass('active');
	});

	jQuery(window).on('resize', function () {
		if (window.matchMedia('(min-width: 768px)').matches) {
			jQuery('html').removeClass('active-m-menu');
			jQuery('#toggle').removeClass('active');
		}
	})
}

function initObjectFitIE() {
	var userAgent = window.navigator.userAgent;
	var ieReg = /msie|Trident.*rv[ :]*11\./gi;
	var edgeReg = / Edge\/([0-9\.]*)/;
	var ie11 = ieReg.test(userAgent);
	var edge = edgeReg.test(userAgent);
	var retina = window.devicePixelRatio > 1;
	if (ie11 || edge) {
		jQuery(".bg-stretch").each(function () {
			var $container = jQuery(this);
			var imgUrl = $container.find("img").attr("src");
			var imgUrlRetina = $container.find("img").attr("srcset").split(' ')[0];
			if (imgUrl) {
				$container.prepend('<div class="bg-stretch-ie">');
				$container.find('.bg-stretch-ie').css({
					"position": "absolute",
					"top": "0",
					"left": "0",
					"right": "0",
					"bottom": "0",
					"background-size": "cover",
					"background-position": "50% 50%"
				});
				if (retina) {
					$container.find('.bg-stretch-ie').css({ "background-image": 'url(' + imgUrlRetina + ')' });
				} else {
					$container.find('.bg-stretch-ie').css({ "background-image": 'url(' + imgUrl + ')' });
				}
			}
		});
	}
}


/*!
 * JavaScript Custom Forms
 *
 * Copyright 2014-2015 PSD2HTML - http://psd2html.com/jcf
 * Released under the MIT license (LICENSE.txt)
 *
 * Version: 1.1.3
 */
;(function(root, factory) {
	'use strict';
	if (typeof define === 'function' && define.amd) {
		define(['jquery'], factory);
	} else if (typeof exports === 'object') {
		module.exports = factory(require('jquery'));
	} else {
		root.jcf = factory(jQuery);
	}
}(this, function($) {
	'use strict';

	// define version
	var version = '1.1.3';

	// private variables
	var customInstances = [];

	// default global options
	var commonOptions = {
		optionsKey: 'jcf',
		dataKey: 'jcf-instance',
		rtlClass: 'jcf-rtl',
		focusClass: 'jcf-focus',
		pressedClass: 'jcf-pressed',
		disabledClass: 'jcf-disabled',
		hiddenClass: 'jcf-hidden',
		resetAppearanceClass: 'jcf-reset-appearance',
		unselectableClass: 'jcf-unselectable'
	};

	// detect device type
	var isTouchDevice = ('ontouchstart' in window) || window.DocumentTouch && document instanceof window.DocumentTouch,
		isWinPhoneDevice = /Windows Phone/.test(navigator.userAgent);
	commonOptions.isMobileDevice = !!(isTouchDevice || isWinPhoneDevice);

	var isIOS = /(iPad|iPhone).*OS ([0-9_]*) .*/.exec(navigator.userAgent);
	if(isIOS) isIOS = parseFloat(isIOS[2].replace(/_/g, '.'));
	commonOptions.ios = isIOS;

	// create global stylesheet if custom forms are used
	var createStyleSheet = function() {
		var styleTag = $('<style>').appendTo('head'),
			styleSheet = styleTag.prop('sheet') || styleTag.prop('styleSheet');

		// crossbrowser style handling
		var addCSSRule = function(selector, rules, index) {
			if (styleSheet.insertRule) {
				styleSheet.insertRule(selector + '{' + rules + '}', index);
			} else {
				styleSheet.addRule(selector, rules, index);
			}
		};

		// add special rules
		addCSSRule('.' + commonOptions.hiddenClass, 'position:absolute !important;left:-9999px !important;height:1px !important;width:1px !important;margin:0 !important;border-width:0 !important;-webkit-appearance:none;-moz-appearance:none;appearance:none');
		addCSSRule('.' + commonOptions.rtlClass + ' .' + commonOptions.hiddenClass, 'right:-9999px !important; left: auto !important');
		addCSSRule('.' + commonOptions.unselectableClass, '-webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; -webkit-tap-highlight-color: rgba(0,0,0,0);');
		addCSSRule('.' + commonOptions.resetAppearanceClass, 'background: none; border: none; -webkit-appearance: none; appearance: none; opacity: 0; filter: alpha(opacity=0);');

		// detect rtl pages
		var html = $('html'), body = $('body');
		if (html.css('direction') === 'rtl' || body.css('direction') === 'rtl') {
			html.addClass(commonOptions.rtlClass);
		}

		// handle form reset event
		html.on('reset', function() {
			setTimeout(function() {
				api.refreshAll();
			}, 0);
		});

		// mark stylesheet as created
		commonOptions.styleSheetCreated = true;
	};

	// simplified pointer events handler
	(function() {
		var pointerEventsSupported = navigator.pointerEnabled || navigator.msPointerEnabled,
			touchEventsSupported = ('ontouchstart' in window) || window.DocumentTouch && document instanceof window.DocumentTouch,
			eventList, eventMap = {}, eventPrefix = 'jcf-';

		// detect events to attach
		if (pointerEventsSupported) {
			eventList = {
				pointerover: navigator.pointerEnabled ? 'pointerover' : 'MSPointerOver',
				pointerdown: navigator.pointerEnabled ? 'pointerdown' : 'MSPointerDown',
				pointermove: navigator.pointerEnabled ? 'pointermove' : 'MSPointerMove',
				pointerup: navigator.pointerEnabled ? 'pointerup' : 'MSPointerUp'
			};
		} else {
			eventList = {
				pointerover: 'mouseover',
				pointerdown: 'mousedown' + (touchEventsSupported ? ' touchstart' : ''),
				pointermove: 'mousemove' + (touchEventsSupported ? ' touchmove' : ''),
				pointerup: 'mouseup' + (touchEventsSupported ? ' touchend' : '')
			};
		}

		// create event map
		$.each(eventList, function(targetEventName, fakeEventList) {
			$.each(fakeEventList.split(' '), function(index, fakeEventName) {
				eventMap[fakeEventName] = targetEventName;
			});
		});

		// jQuery event hooks
		$.each(eventList, function(eventName, eventHandlers) {
			eventHandlers = eventHandlers.split(' ');
			$.event.special[eventPrefix + eventName] = {
				setup: function() {
					var self = this;
					$.each(eventHandlers, function(index, fallbackEvent) {
						if (self.addEventListener) self.addEventListener(fallbackEvent, fixEvent, false);
						else self['on' + fallbackEvent] = fixEvent;
					});
				},
				teardown: function() {
					var self = this;
					$.each(eventHandlers, function(index, fallbackEvent) {
						if (self.addEventListener) self.removeEventListener(fallbackEvent, fixEvent, false);
						else self['on' + fallbackEvent] = null;
					});
				}
			};
		});

		// check that mouse event are not simulated by mobile browsers
		var lastTouch = null;
		var mouseEventSimulated = function(e) {
			var dx = Math.abs(e.pageX - lastTouch.x),
				dy = Math.abs(e.pageY - lastTouch.y),
				rangeDistance = 25;

			if (dx <= rangeDistance && dy <= rangeDistance) {
				return true;
			}
		};

		// normalize event
		var fixEvent = function(e) {
			var origEvent = e || window.event,
				touchEventData = null,
				targetEventName = eventMap[origEvent.type];

			e = $.event.fix(origEvent);
			e.type = eventPrefix + targetEventName;

			if (origEvent.pointerType) {
				switch (origEvent.pointerType) {
					case 2: e.pointerType = 'touch'; break;
					case 3: e.pointerType = 'pen'; break;
					case 4: e.pointerType = 'mouse'; break;
					default: e.pointerType = origEvent.pointerType;
				}
			} else {
				e.pointerType = origEvent.type.substr(0, 5); // "mouse" or "touch" word length
			}

			if (!e.pageX && !e.pageY) {
				touchEventData = origEvent.changedTouches ? origEvent.changedTouches[0] : origEvent;
				e.pageX = touchEventData.pageX;
				e.pageY = touchEventData.pageY;
			}

			if (origEvent.type === 'touchend') {
				lastTouch = { x: e.pageX, y: e.pageY };
			}
			if (e.pointerType === 'mouse' && lastTouch && mouseEventSimulated(e)) {
				return;
			} else {
				return ($.event.dispatch || $.event.handle).call(this, e);
			}
		};
	}());

	// custom mousewheel/trackpad handler
	(function() {
		var wheelEvents = ('onwheel' in document || document.documentMode >= 9 ? 'wheel' : 'mousewheel DOMMouseScroll').split(' '),
			shimEventName = 'jcf-mousewheel';

		$.event.special[shimEventName] = {
			setup: function() {
				var self = this;
				$.each(wheelEvents, function(index, fallbackEvent) {
					if (self.addEventListener) self.addEventListener(fallbackEvent, fixEvent, false);
					else self['on' + fallbackEvent] = fixEvent;
				});
			},
			teardown: function() {
				var self = this;
				$.each(wheelEvents, function(index, fallbackEvent) {
					if (self.addEventListener) self.removeEventListener(fallbackEvent, fixEvent, false);
					else self['on' + fallbackEvent] = null;
				});
			}
		};

		var fixEvent = function(e) {
			var origEvent = e || window.event;
			e = $.event.fix(origEvent);
			e.type = shimEventName;

			// old wheel events handler
			if ('detail'      in origEvent) { e.deltaY = -origEvent.detail;      }
			if ('wheelDelta'  in origEvent) { e.deltaY = -origEvent.wheelDelta;  }
			if ('wheelDeltaY' in origEvent) { e.deltaY = -origEvent.wheelDeltaY; }
			if ('wheelDeltaX' in origEvent) { e.deltaX = -origEvent.wheelDeltaX; }

			// modern wheel event handler
			if ('deltaY' in origEvent) {
				e.deltaY = origEvent.deltaY;
			}
			if ('deltaX' in origEvent) {
				e.deltaX = origEvent.deltaX;
			}

			// handle deltaMode for mouse wheel
			e.delta = e.deltaY || e.deltaX;
			if (origEvent.deltaMode === 1) {
				var lineHeight = 16;
				e.delta *= lineHeight;
				e.deltaY *= lineHeight;
				e.deltaX *= lineHeight;
			}

			return ($.event.dispatch || $.event.handle).call(this, e);
		};
	}());

	// extra module methods
	var moduleMixin = {
		// provide function for firing native events
		fireNativeEvent: function(elements, eventName) {
			$(elements).each(function() {
				var element = this, eventObject;
				if (element.dispatchEvent) {
					eventObject = document.createEvent('HTMLEvents');
					eventObject.initEvent(eventName, true, true);
					element.dispatchEvent(eventObject);
				} else if (document.createEventObject) {
					eventObject = document.createEventObject();
					eventObject.target = element;
					element.fireEvent('on' + eventName, eventObject);
				}
			});
		},
		// bind event handlers for module instance (functions beggining with "on")
		bindHandlers: function() {
			var self = this;
			$.each(self, function(propName, propValue) {
				if (propName.indexOf('on') === 0 && $.isFunction(propValue)) {
					// dont use $.proxy here because it doesn't create unique handler
					self[propName] = function() {
						return propValue.apply(self, arguments);
					};
				}
			});
		}
	};

	// public API
	var api = {
		version: version,
		modules: {},
		getOptions: function() {
			return $.extend({}, commonOptions);
		},
		setOptions: function(moduleName, moduleOptions) {
			if (arguments.length > 1) {
				// set module options
				if (this.modules[moduleName]) {
					$.extend(this.modules[moduleName].prototype.options, moduleOptions);
				}
			} else {
				// set common options
				$.extend(commonOptions, moduleName);
			}
		},
		addModule: function(proto) {
			// add module to list
			var Module = function(options) {
				// save instance to collection
				if (!options.element.data(commonOptions.dataKey)) {
					options.element.data(commonOptions.dataKey, this);
				}
				customInstances.push(this);

				// save options
				this.options = $.extend({}, commonOptions, this.options, getInlineOptions(options.element), options);

				// bind event handlers to instance
				this.bindHandlers();

				// call constructor
				this.init.apply(this, arguments);
			};

			// parse options from HTML attribute
			var getInlineOptions = function(element) {
				var dataOptions = element.data(commonOptions.optionsKey),
					attrOptions = element.attr(commonOptions.optionsKey);

				if (dataOptions) {
					return dataOptions;
				} else if (attrOptions) {
					try {
						return $.parseJSON(attrOptions);
					} catch (e) {
						// ignore invalid attributes
					}
				}
			};

			// set proto as prototype for new module
			Module.prototype = proto;

			// add mixin methods to module proto
			$.extend(proto, moduleMixin);
			if (proto.plugins) {
				$.each(proto.plugins, function(pluginName, plugin) {
					$.extend(plugin.prototype, moduleMixin);
				});
			}

			// override destroy method
			var originalDestroy = Module.prototype.destroy;
			Module.prototype.destroy = function() {
				this.options.element.removeData(this.options.dataKey);

				for (var i = customInstances.length - 1; i >= 0; i--) {
					if (customInstances[i] === this) {
						customInstances.splice(i, 1);
						break;
					}
				}

				if (originalDestroy) {
					originalDestroy.apply(this, arguments);
				}
			};

			// save module to list
			this.modules[proto.name] = Module;
		},
		getInstance: function(element) {
			return $(element).data(commonOptions.dataKey);
		},
		replace: function(elements, moduleName, customOptions) {
			var self = this,
				instance;

			if (!commonOptions.styleSheetCreated) {
				createStyleSheet();
			}

			$(elements).each(function() {
				var moduleOptions,
					element = $(this);

				instance = element.data(commonOptions.dataKey);
				if (instance) {
					instance.refresh();
				} else {
					if (!moduleName) {
						$.each(self.modules, function(currentModuleName, module) {
							if (module.prototype.matchElement.call(module.prototype, element)) {
								moduleName = currentModuleName;
								return false;
							}
						});
					}
					if (moduleName) {
						moduleOptions = $.extend({ element: element }, customOptions);
						instance = new self.modules[moduleName](moduleOptions);
					}
				}
			});
			return instance;
		},
		refresh: function(elements) {
			$(elements).each(function() {
				var instance = $(this).data(commonOptions.dataKey);
				if (instance) {
					instance.refresh();
				}
			});
		},
		destroy: function(elements) {
			$(elements).each(function() {
				var instance = $(this).data(commonOptions.dataKey);
				if (instance) {
					instance.destroy();
				}
			});
		},
		replaceAll: function(context) {
			var self = this;
			$.each(this.modules, function(moduleName, module) {
				$(module.prototype.selector, context).each(function() {
					if (this.className.indexOf('jcf-ignore') < 0) {
						self.replace(this, moduleName);
					}
				});
			});
		},
		refreshAll: function(context) {
			if (context) {
				$.each(this.modules, function(moduleName, module) {
					$(module.prototype.selector, context).each(function() {
						var instance = $(this).data(commonOptions.dataKey);
						if (instance) {
							instance.refresh();
						}
					});
				});
			} else {
				for (var i = customInstances.length - 1; i >= 0; i--) {
					customInstances[i].refresh();
				}
			}
		},
		destroyAll: function(context) {
			if (context) {
				$.each(this.modules, function(moduleName, module) {
					$(module.prototype.selector, context).each(function(index, element) {
						var instance = $(element).data(commonOptions.dataKey);
						if (instance) {
							instance.destroy();
						}
					});
				});
			} else {
				while (customInstances.length) {
					customInstances[0].destroy();
				}
			}
		}
	};

	// always export API to the global window object
	window.jcf = api;

	return api;
}));

 /*!
 * JavaScript Custom Forms : Checkbox Module
 *
 * Copyright 2014-2015 PSD2HTML - http://psd2html.com/jcf
 * Released under the MIT license (LICENSE.txt)
 *
 * Version: 1.1.3
 */
;(function($) {
	'use strict';

	jcf.addModule({
		name: 'Checkbox',
		selector: 'input[type="checkbox"]',
		options: {
			wrapNative: true,
			checkedClass: 'jcf-checked',
			uncheckedClass: 'jcf-unchecked',
			labelActiveClass: 'jcf-label-active',
			fakeStructure: '<span class="jcf-checkbox"><span></span></span>'
		},
		matchElement: function(element) {
			return element.is(':checkbox');
		},
		init: function() {
			this.initStructure();
			this.attachEvents();
			this.refresh();
		},
		initStructure: function() {
			// prepare structure
			this.doc = $(document);
			this.realElement = $(this.options.element);
			this.fakeElement = $(this.options.fakeStructure).insertAfter(this.realElement);
			this.labelElement = this.getLabelFor();

			if (this.options.wrapNative) {
				// wrap native checkbox inside fake block
				this.realElement.appendTo(this.fakeElement).css({
					position: 'absolute',
					height: '100%',
					width: '100%',
					opacity: 0,
					margin: 0
				});
			} else {
				// just hide native checkbox
				this.realElement.addClass(this.options.hiddenClass);
			}
		},
		attachEvents: function() {
			// add event handlers
			this.realElement.on({
				focus: this.onFocus,
				click: this.onRealClick
			});
			this.fakeElement.on('click', this.onFakeClick);
			this.fakeElement.on('jcf-pointerdown', this.onPress);
		},
		onRealClick: function(e) {
			// just redraw fake element (setTimeout handles click that might be prevented)
			var self = this;
			this.savedEventObject = e;
			setTimeout(function() {
				self.refresh();
			}, 0);
		},
		onFakeClick: function(e) {
			// skip event if clicked on real element inside wrapper
			if (this.options.wrapNative && this.realElement.is(e.target)) {
				return;
			}

			// toggle checked class
			if (!this.realElement.is(':disabled')) {
				delete this.savedEventObject;
				this.stateChecked = this.realElement.prop('checked');
				this.realElement.prop('checked', !this.stateChecked);
				this.fireNativeEvent(this.realElement, 'click');
				if (this.savedEventObject && this.savedEventObject.isDefaultPrevented()) {
					this.realElement.prop('checked', this.stateChecked);
				} else {
					this.fireNativeEvent(this.realElement, 'change');
				}
				delete this.savedEventObject;
			}
		},
		onFocus: function() {
			if (!this.pressedFlag || !this.focusedFlag) {
				this.focusedFlag = true;
				this.fakeElement.addClass(this.options.focusClass);
				this.realElement.on('blur', this.onBlur);
			}
		},
		onBlur: function() {
			if (!this.pressedFlag) {
				this.focusedFlag = false;
				this.fakeElement.removeClass(this.options.focusClass);
				this.realElement.off('blur', this.onBlur);
			}
		},
		onPress: function(e) {
			if (!this.focusedFlag && e.pointerType === 'mouse') {
				this.realElement.focus();
			}
			this.pressedFlag = true;
			this.fakeElement.addClass(this.options.pressedClass);
			this.doc.on('jcf-pointerup', this.onRelease);
		},
		onRelease: function(e) {
			if (this.focusedFlag && e.pointerType === 'mouse') {
				this.realElement.focus();
			}
			this.pressedFlag = false;
			this.fakeElement.removeClass(this.options.pressedClass);
			this.doc.off('jcf-pointerup', this.onRelease);
		},
		getLabelFor: function() {
			var parentLabel = this.realElement.closest('label'),
				elementId = this.realElement.prop('id');

			if (!parentLabel.length && elementId) {
				parentLabel = $('label[for="' + elementId + '"]');
			}
			return parentLabel.length ? parentLabel : null;
		},
		refresh: function() {
			// redraw custom checkbox
			var isChecked = this.realElement.is(':checked'),
				isDisabled = this.realElement.is(':disabled');

			this.fakeElement.toggleClass(this.options.checkedClass, isChecked)
							.toggleClass(this.options.uncheckedClass, !isChecked)
							.toggleClass(this.options.disabledClass, isDisabled);

			if (this.labelElement) {
				this.labelElement.toggleClass(this.options.labelActiveClass, isChecked);
			}
		},
		destroy: function() {
			// restore structure
			if (this.options.wrapNative) {
				this.realElement.insertBefore(this.fakeElement).css({
					position: '',
					width: '',
					height: '',
					opacity: '',
					margin: ''
				});
			} else {
				this.realElement.removeClass(this.options.hiddenClass);
			}

			// removing element will also remove its event handlers
			this.fakeElement.off('jcf-pointerdown', this.onPress);
			this.fakeElement.remove();

			// remove other event handlers
			this.doc.off('jcf-pointerup', this.onRelease);
			this.realElement.off({
				focus: this.onFocus,
				click: this.onRealClick
			});
		}
	});

}(jQuery));
