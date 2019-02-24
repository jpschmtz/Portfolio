(function () {
    if (window.SevDesLib) {
        return;
    }

    var SevDesLib = {};

    // UTIL
    // ====

    SevDesLib.openJsonFile = function (url) {
        return new Promise(function (resolve, reject) {
            const xhr = new XMLHttpRequest();
            xhr.open("GET", url);
            xhr.onload = function () {
                try {
                    resolve(JSON.parse(xhr.responseText));
                }
                catch (e) {
                    reject("Failed to parse json");
                }
            };
            xhr.onerror = function () {
                reject(xhr.statusText)
            };
            xhr.send();
        });
    };

    SevDesLib.distanceFromTopListener = function (callback) {
        document.addEventListener('scroll', function () {
            var doc = document.documentElement;
            var top = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
            callback(top);
        });
    };

    SevDesLib.distanceFromTopOfPage = function getPosition(element) {
        var position = 0;

        while (element) {
            position += (element.offsetTop - element.scrollTop + element.clientTop);
            element = element.offsetParent;
        }

        return position;
    };

    SevDesLib.getElementPosition = function(element, topOffset, contentsHeight) {
        var clientRect = element.getClientRects()[0];
        topOffset = topOffset || 0;
        var top = clientRect.top - topOffset;
        var max = clientRect.height - (contentsHeight || window.innerHeight);

        if (top > 0) {
            return -1;
        }

        return Math.max(top * -1 / max, 0);
    };

    SevDesLib.createForEachElement = function (attr, constructor) {
        _.forEach(document.querySelectorAll("[" + attr + "]"), function (element) {
            new constructor(element);
        });
    };

    SevDesLib.isMobile = function(){
        var testExp = new RegExp('Android|webOS|iPhone|BlackBerry|Windows Phone|Opera Mini|IEMobile|Mobile|MSIE|Trident', 'i');
        if (testExp.test(navigator.userAgent)){ return true; }
        else { return false; }
    };


    // Scroll To Play Video
    // ====================

    const CAPTION_START_ATTR = "video-caption-start";
    const CAPTION_END_ATTR = "video-caption-end";
    const CAPTION_PAUSE_ATTR = "video-caption-pause";
    const CAPTION_ACTIVE_ATTR = "video-caption-active-class";

    const POSITION_CENTER = 'center'; // TODO
    const POSITION_EXPAND = 'expand';
    const POSITION_PEEK = 'peek';

    const FRAME_WILDCARD = /#+/;
    const FRAME_DURATION = 30 / 1000;

    const VIDEO_SCROLLER_DEFAULTS = {
        pixelsPerSecond: 1000,
        scrollTimeout: 0,
        captions: null,
        container: null,
        framePath: null,
        frameIndexStart: 1,
        frameIndexEnd: null,
        framesPerSecond: 20,
        intervalTime: 500,
        loadingThreshold: 0.9,
        paddingTopPx: 0,
        positionType: POSITION_PEEK,
        progressBar: false
    };

    const PROGRESS_BAR_DEFAULTS = {
        color: '#FFFFFF',
        height: '2px',
        width: '100%',
        background: 'transparent'
    };

    var VideoScroller = function (options) {
        _.defaults(this, options, VIDEO_SCROLLER_DEFAULTS);

        if (SevDesLib.isMobile()) {
            this.container.style.display = "none";
            return;
        }

        if (!this.container) {
            throw "A video container was not provided";
        }

        this.captionOptions = options.captions;

        if (!this.framePaths) {
            throw "Video or frame path need to be provided"
        }
        if (!this.frameIndexEnd) {
            throw "Frame index end is required if using frame images"
        }

        this.initFrames();

        if (options.progressBar) {
            this.initProgressBar(options.progressBar);
        }
    };

    VideoScroller.prototype.imageFramePath = function (index, mediaQuery) {
        var number = String(index);
        var framePath = this.framePaths[mediaQuery];
        var paddingAmount = framePath.match(FRAME_WILDCARD)[0].length;

        while (paddingAmount && number.length < paddingAmount) {
            number = "0" + number;
        }

        return framePath.replace(FRAME_WILDCARD, number);
    };

    VideoScroller.prototype.createImage = function (src) {
        var img = window.document.createElement('IMG');

        img.src = src;
        img.style.display = 'none';
        img.style.width = '100%';
        img.style.height = 'auto';
        img.style.position = 'absolute';
        img.style.top = '0';
        img.style.left = '0';

        return img;
    };

    VideoScroller.prototype.getCurrentFrame = function() {
        return this.getFrame(this.currentFrame);
    };

    VideoScroller.prototype.getFrame = function(frameIndex) {
        return this.frames[frameIndex] ? this.frames[frameIndex][this.activeMediaQuery] : null;
    };

    VideoScroller.prototype.setActiveMedia = function(m) {
        if (m.matches) {
            this.initFramesForMediaQuery(m.media);
            this.hideCurrentFrame();
            this.activeMediaQuery = m.media;
            this.setCurrentFrame();
        }
    };

    VideoScroller.prototype.hideCurrentFrame = function() {
        var curFrame = this.getCurrentFrame();
        if (curFrame) {
            curFrame.style.opacity = '0';
        }
    };

    VideoScroller.prototype.displayBlockAllFrames = function() {
        _.forEach(this.container.querySelectorAll('img'), function(img) {            
            img.style.display = 'block';
        });
    };

    VideoScroller.prototype.hideAllFrames = function() {
        _.forEach(this.container.querySelectorAll('img'), function(img) {            
            img.style.opacity = '0';
        });
    };

    VideoScroller.prototype.setCurrentFrame = function(frameIndex) {
        this.currentFrame = frameIndex || this.currentFrame;
        this.getFrame(this.currentFrame).style.opacity = '1';
    };

    VideoScroller.prototype.initFrames = function () {
        this.frameContainer = window.document.createElement('DIV');
        this.container.appendChild(this.frameContainer);
        this.setPositionedElement(this.frameContainer);

        if (this.container.childElementCount) {
            this.loadingElement = this.container.children[0];
            this.loadingElement.style.position = 'absolute';
            this.loadingElement.style.zIndex = '1';
            this.loadingElement.style.left = '50%';
            this.loadingElement.style.top = '50%';
            this.loadingElement.style.transform = 'translate(-50%, -50%)';

            this.positionedElement.appendChild(this.loadingElement);
        }

        this.frames = [];
        this.currentFrame = 0;
        this.framesLoaded = 0;

        var mediaQueryKeys = Object.keys(this.framePaths);

        _.forEach(mediaQueryKeys, function (mediaQuery) {
            var matchMedia = window.matchMedia(mediaQuery);

            // Edge and some other browsers modify the media query that created a matchMedia object.
            // To get around this, reassign the path to this modified query.
            this.framePaths[matchMedia.media] = this.framePaths[mediaQuery];

            this.setActiveMedia(matchMedia);
            matchMedia.addListener(this.setActiveMedia.bind(this));
        }.bind(this));

        // Only add loading listeners if there is a loading element
        if (this.loadingElement) {
            _.forEach(this.frames.slice(1), function (frame) {
                // Only add listeners for the starting screen size
                var img = frame[this.activeMediaQuery];
                img.addEventListener('load', this.frameLoaded.bind(this, img));
            }.bind(this));
        }

        if (this.captionOptions) {
            this.generateCaptions(this.captionOptions);
        }

        var firstFrame = this.getCurrentFrame();
        if (firstFrame) {
            firstFrame.style.display = 'block';

            var firstFrameLoaded = function () {
                this.containerHeight = this.frames.length * FRAME_DURATION * this.pixelsPerSecond;
                this.updateTargetFrame();
            }.bind(this);

            if (firstFrame.complete) {
                firstFrameLoaded();
            }
            else {
                firstFrame.addEventListener('load', firstFrameLoaded);
            }
        }
        else {
            this.hideLoadingElement();
        }
    };

    VideoScroller.prototype.initFramesForMediaQuery = function(mediaQuery) {
        if (this.frames[0] && this.frames[0][mediaQuery]) {
            return;
        }

        for (var index = 0; index <= this.frameIndexEnd - this.frameIndexStart; index++) {
            if (!this.frames[index]) {
                this.frames.push({});
            }

            var path = this.imageFramePath(index, mediaQuery);
            var img = this.createImage(path);

            this.frameContainer.appendChild(img);
            this.frames[index][mediaQuery] = img;
        }
    };

    VideoScroller.prototype.hideLoadingElement = function() {
        this.loaded = true;
        this.loadingElement.style.display = 'none';
    };

    VideoScroller.prototype.frameLoaded = function(frame) {
        this.framesLoaded++;

        frame.style.display = 'none';

        if (this.framesLoaded + this.pauseAmount >= (this.frames.length - 1) * this.loadingThreshold) {
            this.hideLoadingElement();
            this.displayBlockAllFrames();
            this.hideAllFrames();
        }
    };

    VideoScroller.prototype.initProgressBar = function (options) {
        this.progressBarOptions = {};
        _.defaults(this.progressBarOptions, options, PROGRESS_BAR_DEFAULTS);

        this.progressBar = window.document.createElement('DIV');
        this.progressBarContainer = window.document.createElement('DIV');

        this.progressBarContainer.style.height = this.progressBarOptions.height;
        this.progressBarContainer.style.width = this.progressBarOptions.width;
        this.progressBarContainer.style.background = this.progressBarOptions.background;
        this.progressBarContainer.style.position = 'absolute';
        this.progressBarContainer.style.bottom = 0;
        this.progressBarContainer.style.left = 0;

        this.progressBar.style.height = '100%';
        this.progressBar.style.width = 0;
        this.progressBar.style.background = this.progressBarOptions.color;

        this.progressBarContainer.appendChild(this.progressBar);
        this.positionedElement.appendChild(this.progressBarContainer);
    };

    VideoScroller.prototype.setPositionedElement = function (element) {
        this.originalTop = element.style.top || 'auto';
        this.originalBottom = element.style.bottom || 'auto';
        this.originalPosition = element.style.position || 'relative';

        this.positionedElement = element;

        if (POSITION_EXPAND === this.positionType) {
            this.positionedElement.style.height = '100vh';
            this.positionedElement.style.width = 'auto';
            this.positionedElement.style.left = '50%';
            this.positionedElement.style.transform = 'translateX(-50%)';
        }
        else if (POSITION_PEEK === this.positionType) {
            this.peekingElement = this.peekingElement || this.container.nextElementSibling;
            this.positionedElement.style.width = this.container.offsetWidth + 'px';
        }

        if (!this.peekingElement) {
            this.container.style.height = this.containerHeight + 'px';
        }

        this.container.style.position = 'relative';
        window.addEventListener('scroll', this.onScroll.bind(this), false);
        window.addEventListener('resize', this.resizeVideo.bind(this), false);
    };

    VideoScroller.prototype.resizeVideo = function () {
        if (POSITION_PEEK === this.positionType) {
            this.positionedElement.style.width = this.container.offsetWidth + 'px';
        }

        if (!this.peekingElement) {
            this.container.style.height = this.containerHeight + 'px';
        }

        this.updateTargetFrame();
    };

    VideoScroller.prototype.getWindowScrollPosition = function () {
        var doc = document.documentElement;
        return (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
    };

    VideoScroller.prototype.onScroll = function () {
        if (this.waiting) {
            return;
        }

        this.waiting = true;

        if (this.loaded) {
            this.updateTargetFrame();
        }

        setTimeout(function () {
            this.waiting = false;
        }.bind(this), this.scrollTimeout);
    };

    VideoScroller.prototype.updateTargetFrame = function () {
        if (!this.activeMediaQuery) {
            return
        }

        var percent = SevDesLib.getElementPosition(this.container, this.paddingTopPx, this.positionedElement.offsetHeight);
        var currentFrameHeight = this.getCurrentFrame().offsetHeight;

        // If windowScrollTop is before the container
        if (percent < 0) {
            this.positionedElement.style.position = this.originalPosition;
            this.positionedElement.style.top = this.originalTop;
            this.positionedElement.style.bottom = this.originalBottom;
            this.positionedElement.style.height = currentFrameHeight + 'px';

            if (this.peekingElement) {
                this.container.style.height = currentFrameHeight + 'px';

                this.peekingElement.style.position = "relative";
                this.peekingElement.style.top = '0';
            }
        }
        // if windowScrollTop is after the container
        else if (percent > 1) {
            this.positionedElement.style.position = "absolute";
            this.positionedElement.style.top = "auto";
            this.positionedElement.style.bottom = "0";

            if (this.peekingElement) {
                this.container.style.height = this.containerHeight + 'px';

                this.peekingElement.style.position = "relative";
                this.peekingElement.style.top = '0';
            }
        }
        // If windowScrollTop is within the container
        else {
            this.positionedElement.style.position = "fixed";
            this.positionedElement.style.top = this.paddingTopPx + 'px';
            this.positionedElement.style.bottom = "auto";

            if (this.peekingElement) {
                this.container.style.height = this.containerHeight + 'px';

                this.peekingElement.style.position = "fixed";
                this.peekingElement.style.top = (currentFrameHeight + this.paddingTopPx) + 'px';
                this.peekingElement.style.width = '100%';
                this.peekingElement.style.zIndex = '10';
            }
        }


        percent = Math.max(0, Math.min(1, percent));

        this.progressBar.width = (100 * percent) + '%';

        this.intervalStartTime = Date.now();

        this.frameIntervalStart = this.currentFrame;
        this.frameIntervalDuration = Math.round((this.frames.length - 1) * percent) - this.frameIntervalStart;

        this.captions.forEach(function (caption) {
            var start = parseInt(caption.getAttribute(CAPTION_START_ATTR));
            var end = parseInt(caption.getAttribute(CAPTION_END_ATTR));
            var activeClass = caption.getAttribute(CAPTION_ACTIVE_ATTR);

            if (0 < this.currentFrame && start <= this.currentFrame && this.currentFrame < end && this.currentFrame < this.frames.length) {
                if (activeClass) {
                    caption.classList.add(activeClass);
                }
                else {
                    caption.style.display = "block";
                }
            }
            else {
                if (activeClass) {
                    caption.classList.remove(activeClass);
                }
                else {
                    caption.style.display = "none";
                }
            }
        }.bind(this));

        if (!this.intervalTimer) {
            this.intervalTimer = setInterval(this.videoLoop.bind(this), 1000 / this.framesPerSecond);
        }
    };

    // TODO MAKE CONFIGURABLE
    function easingFunction(t) {
        var pow = 5;
        return Math.pow(1 - t, pow);
    }

    const CLEAN_PERIOD_LENGTH = 100;

    VideoScroller.prototype.videoLoop = function () {
        const i = (Date.now() - this.intervalStartTime) / this.intervalTime;
        // configurable
        if (i >= 1) {
            return;
        }

        const easing = easingFunction(i);
        var newFrame = Math.round(this.frameIntervalStart + this.frameIntervalDuration * easing);
        this.cleanCount = ((this.cleanCount || 0) + 1) % CLEAN_PERIOD_LENGTH;

        if (this.cleanCount === 0) {
            this.hideAllFrames();
        }
        else {
            this.hideCurrentFrame();
        }
        this.setCurrentFrame(newFrame)
    };

    VideoScroller.prototype.generateCaptions = function () {
        this.captions = [];
        this.pauseAmount = 0;

        this.captionOptions.captions.forEach(function (captionOption) {
            var caption = document.createElement('DIV');

            if (!captionOption.start) {
                console.error("Caption does not have a start");
                return;
            }

            caption.setAttribute(CAPTION_START_ATTR, captionOption.start);

            if (captionOption.pause) {
                this.pauseAmount += captionOption.pause;
                caption.setAttribute(CAPTION_END_ATTR, captionOption.start + captionOption.pause);

                for (var pause = captionOption.pause; pause > 0; pause--) {
                    var image = this.frames[captionOption.start];
                    this.frames.splice(captionOption.start, 0, image);
                }
            }
            else if (captionOption.end) {
                caption.setAttribute(CAPTION_END_ATTR, captionOption.end);
            }
            else {
                console.error("Caption does not have an end or pause duration");
                return;
            }

            caption.style.position = "fixed";
            caption.innerText = captionOption.text;

            if (this.captionOptions.activeClass) {
                caption.setAttribute(CAPTION_ACTIVE_ATTR, this.captionOptions.activeClass);
            }
            else if (captionOption.activeClass) {
                caption.setAttribute(CAPTION_ACTIVE_ATTR, this.captionOptions.activeClass + " " + captionOption.activeClass);
            }
            else {
                caption.style.display = "none";
            }

            if (this.captionOptions.classes) {
                if (typeof this.captionOptions.classes == 'string'){
                    caption.classList.add(this.captionOptions.classes);
                }
                if (typeof this.captionOptions.classes == 'object') {
                    for(var x = 0; x < this.captionOptions.classes.length; x++) {
                        caption.classList.add(this.captionOptions.classes[x]);
                    }
                }
            }
            if (captionOption.classes) {
                if (typeof captionOption.classes == 'string'){
                    caption.classList.add(captionOption.classes);
                }
                if (typeof captionOption.classes == 'object') {
                    for(var x = 0; x < captionOption.classes.length; x++) {
                        caption.classList.add(captionOption.classes[x]);
                    }
                }
            }

            if (captionOption.style) {
                _.forEach(captionOption.style, function (style, property) {
                    caption.style[property] = style;
                })
            }

            //this.container.appendChild(caption);
            this.positionedElement.appendChild(caption);
            this.captions.push(caption);
        }.bind(this));
    };


    SevDesLib.VideoScroller = VideoScroller;


    // Drawer

    SevDesLib._drawerControllers = {};

    const DRAWER_GRID_ATTR = 'drawer-grid';
    const DRAWER_DURATION_ATTR = 'drawer-duration-ms';
    const DRAWER_BUFFER_ATTR = 'drawer-scroll-buffer';
    const DRAWER_BUTTON_ATTR = 'drawer-button';
    const DRAWER_CONTENTS_ATTR = 'drawer-contents';
    const COPY_SUFFIX = '-copy';
    const DRAWER_ACTIVE_CLASS = 'active';
    const DRAWER_CLOSED_CLASS = 'closed';
    const NO_ACTIVE_BUTTON = -1;

    const DRAWER_DURATION_DEFAULT = 500;
    const DRAWER_BUFFER_DEFAULT = '25%';

    const PERCENT = '%';
    const PIXELS = 'px';

    var DrawerController = function (element) {
        var drawerId = element.getAttribute(DRAWER_GRID_ATTR);
        var drawerSelector = "#" + drawerId;

        SevDesLib._drawerControllers[drawerId] = this;

        this.grid = element;
        this.drawer = document.querySelector(drawerSelector);
        this.drawerCopy = document.querySelector(drawerSelector + COPY_SUFFIX);

        // Open animation time
        var durationAttr = this.grid.getAttribute(DRAWER_DURATION_ATTR);
        this.drawerOpenTimeMs = durationAttr ? parseInt(durationAttr) : DRAWER_DURATION_DEFAULT;

        // Scroll buffer amount
        var bufferAttr = this.grid.getAttribute(DRAWER_BUFFER_ATTR) || DRAWER_BUFFER_DEFAULT;
        this.bufferAmount = parseInt(bufferAttr.replace(/[^0-9]/g, ''), 10);
        if (bufferAttr.indexOf(PERCENT) !== -1) {
            this.bufferType = PERCENT;
            this.bufferAmount = this.bufferAmount / 100;
        }
        else if (bufferAttr.indexOf(PIXELS) !== -1) {
            this.bufferType = PIXELS;
        }
        else {
            throw 'Buffer can only accept % or px amounts'
        }

        // If copy doesn't exist yet, make it
        if (!this.drawerCopy) {
            this.drawerCopy = this.drawer.cloneNode(true);
            this.drawerCopy.setAttribute('id', this.drawerCopy.getAttribute('id') + COPY_SUFFIX);

            _.forEach(this.drawerCopy.children, function (child) {
                child.setAttribute('id', child.getAttribute('id') + COPY_SUFFIX);
            });

            this.drawer.parentNode.insertBefore(this.drawerCopy, this.drawer);

            this.setupCss();
        }

        // Add click listener to all buttons
        this.buttons = this.grid.querySelectorAll('[' + DRAWER_BUTTON_ATTR + ']');
        this.gridElements = this.grid.querySelectorAll('.grid__item');
        _.forEach(this.buttons, function (button) {
            button.addEventListener('click', this.click.bind(this, button));
        }.bind(this));

        this.close();

        // Set up row size listener
        window.addEventListener('resize', this.resize.bind(this), false);
        this.resize();
    };

    DrawerController.prototype.resize = function() {
        this.rowSize = this.gridElements.length;

        var firstElement = this.gridElements[0];

        for (var i = 1; i < this.gridElements.length; i++) {
            if (firstElement.offsetTop !== this.gridElements[i].offsetTop) {
                this.rowSize = i;
                break;
            }
        }
    };

    DrawerController.prototype.setupCss = function () {
        this.drawer.classList.add(DRAWER_CLOSED_CLASS);
        this.drawerCopy.classList.add(DRAWER_CLOSED_CLASS);

        var drawerId = this.grid.getAttribute(DRAWER_GRID_ATTR);

        var css =
            '#' + drawerId + ', ' + '#' + drawerId + COPY_SUFFIX + '{' +
                'animation-duration: ' + this.drawerOpenTimeMs + 'ms;' +
                'transition-duration: ' + this.drawerOpenTimeMs + 'ms;' +
            '} '
        ;

        setTimeout(function () {
            var styleElem = document.createElement('style');
            styleElem.appendChild(document.createTextNode(css));
            document.getElementsByTagName('head')[0].appendChild(styleElem);
        })
    };

    // Add trigger to close during white space click

    DrawerController.prototype.close = function () {
        var activeButton = this.getActiveButton();

        this.animate({
            closingDrawer: this.getActiveDrawer(),
            closingButton: activeButton
        });

        this.activeButtonIndex = NO_ACTIVE_BUTTON;

        document.body.removeEventListener('click', this.clickWhiteSpaceFunction);
        this.clickWhiteSpaceFunction = null;
    };

    DrawerController.prototype.closeIfWhitespace = function (event) {
        var currentElem = event.target;

        while (currentElem) {
            if (currentElem === this.grid) {
                return;
            }
            currentElem = currentElem.parentNode;
        }

        this.close();
    };

    DrawerController.prototype.click = function (button) {

        // Close the drawer if we're clicking on the active button
        if (this.isActive(button)) {
            this.close();
            return;
        }

        var activeDrawer = this.getActiveDrawer();
        var contentId = button.getAttribute(DRAWER_BUTTON_ATTR);

        if (!this.clickWhiteSpaceFunction) {
            this.clickWhiteSpaceFunction = this.closeIfWhitespace.bind(this);
            document.body.addEventListener('click', this.clickWhiteSpaceFunction);
        }

        // If we're in the same row, we don't need to close and reopen the drawer
        if (NO_ACTIVE_BUTTON === this.activeButtonIndex || this.isInActiveRow(button)) {
            if (!activeDrawer) {
                this.animate({
                    openingDrawer: this.drawer,
                    openingButton: button
                });
            }
        }
        // If it's in a different row, then we'll want to close and reopen the drawer
        else {
            this.toggleDrawers(button);
        }

        this.showContents(contentId);
        this.setActive(button);
    };

    DrawerController.prototype.isInActiveRow = function (button) {
        var buttonRow = this.getRowForIndex(this.getButtonRowPosition(button));
        var activeRow = this.getRowForIndex(this.activeButtonRowPosition);

        return buttonRow === activeRow;
    };

    DrawerController.prototype.getRowForIndex = function(index) {
        return Math.ceil((index + 1) / this.rowSize);
    };

    DrawerController.prototype.isActive = function (button) {
        return button.classList.contains(DRAWER_ACTIVE_CLASS);
    };

    DrawerController.prototype.showContents = function (contentId) {
        var activeDrawer = this.getActiveDrawer();
        // Hide all other contents
        _.forEach(activeDrawer.querySelectorAll('[' + DRAWER_CONTENTS_ATTR + ']'), function (child) {
            var childContentId = child.getAttribute(DRAWER_CONTENTS_ATTR);

            if (childContentId === contentId) {
                child.style.display = "block";
            }
            else {
                child.style.display = "none";
            }
        });
    };


    DrawerController.prototype.getActiveButton = function () {
        return _.find(this.buttons, this.isActive);
    };

    DrawerController.prototype.getActiveDrawer = function () {
        if (!this.drawer.classList.contains(DRAWER_CLOSED_CLASS)) {
            return this.drawer;
        }

        if (!this.drawerCopy.classList.contains(DRAWER_CLOSED_CLASS)) {
            return this.drawerCopy;
        }

        return null;
    };

    DrawerController.prototype._scrollToButton = function(button) {
        var targetScrollPoint = PIXELS === this.bufferType ? this.bufferAmount : window.innerHeight * this.bufferAmount;
        var topOfDrawer = button.getBoundingClientRect().bottom;
        var scrollAmount = topOfDrawer - targetScrollPoint;

        window.scrollBy({
            top: scrollAmount,
            behavior: 'smooth'
        });
    };

    DrawerController.prototype.scrollToButton = function(button) {
        if (NO_ACTIVE_BUTTON === this.activeButtonIndex) {
            this._scrollToButton(button);
        }
        // TODO Possibly scroll when there a drawer is open
    };

    DrawerController.prototype.animate = function (options) {
        var openingButton = options.openingButton;
        var closingButton = options.closingButton;
        var openingDrawer = options.openingDrawer;
        var closingDrawer = options.closingDrawer;

        if (openingDrawer) {
            if (!this.isInActiveRow(openingButton)) {
                var openingButtonIndex = this.getButtonRowPosition(openingButton);
                var insertBeforeTargetIndex = this.getRowForIndex(openingButtonIndex) * this.rowSize;

                if (insertBeforeTargetIndex < this.gridElements.length) {
                    var insertBeforeButton = this.gridElements[insertBeforeTargetIndex];
                    insertBeforeButton.parentNode.insertBefore(openingDrawer, insertBeforeButton);
                }
                else {
                    openingButton.parentNode.appendChild(openingDrawer);
                }
            }

            openingDrawer.classList.remove(DRAWER_CLOSED_CLASS);
            openingDrawer.style.overflow = "visible";
            this.scrollToButton(openingButton);
        }

        if (closingDrawer) {
            closingDrawer.classList.add(DRAWER_CLOSED_CLASS);
            closingDrawer.style.overflow = "hidden";
        }

        if (closingButton) {
            this.setInactive(closingButton);
        }
    };

    DrawerController.prototype.toggleDrawers = function (button) {
        var animationOptions = {
            openingButton: button,
            closingButton: this.getActiveButton()
        };

        if (this.drawer === this.getActiveDrawer()) {
            animationOptions.openingDrawer = this.drawerCopy;
            animationOptions.closingDrawer = this.drawer;
        }
        else {
            animationOptions.openingDrawer = this.drawer;
            animationOptions.closingDrawer = this.drawerCopy;
        }

        this.animate(animationOptions);
    };

    DrawerController.prototype.getButtonIndex = function (button) {
        var buttonIndex = -1;

        for(var i = 0; i < this.buttons.length; i++){
            if (this.buttons[i] === button){
                buttonIndex = i;
            }
        }

        return buttonIndex;
    };

    DrawerController.prototype.getButtonRowPosition = function (button) {
        var buttonIndex = -1;

        for(var i = 0; i < this.gridElements.length; i++){
            if (this.gridElements[i] === button){
                buttonIndex = i;
            }
        }

        return buttonIndex;
    };

    DrawerController.prototype.setInactive = function (button) {
        button.classList.remove(DRAWER_ACTIVE_CLASS);
    };

    DrawerController.prototype.setActive = function (button) {
        // Deactivate all other buttons
        _.forEach(this.buttons, function (inactiveButton) {
            inactiveButton.classList.remove(DRAWER_ACTIVE_CLASS)
        });

        button.classList.add(DRAWER_ACTIVE_CLASS);
        this.activeButtonIndex = this.getButtonIndex(button);
        this.activeButtonRowPosition = this.getButtonRowPosition(button);
    };

    _.forEach(document.querySelectorAll("[" + DRAWER_GRID_ATTR + "]"), function (element) {
        new DrawerController(element);
    });

    const DRAWER_CLOSE_ATTR = 'drawer-close';

    document.body.addEventListener('click', function (event) {
        var drawerId = event.target.getAttribute(DRAWER_CLOSE_ATTR);
        if (drawerId) {
            SevDesLib._drawerControllers[drawerId].close();
        }
    });


    // TOGGLE FADE

    const TOGGLE_FADE_ATTR = 'toggle-fade';
    const TOGGLE_FADE_HEIGHT_ATTR = 'height-per-item';
    const TOGGLE_FADE_PADDING_ATTR = 'padding-bottom';
    const TOGGLE_FADE_TRANSITION_TIME_ATTR = 'transition-time-ms';

    var ToggleFadeController = function (element) {
        var sectionSelector = element.getAttribute(TOGGLE_FADE_ATTR);

        this.element = element;
        this.container = document.createElement(this.element.tagName);
        this.children = this.element.querySelectorAll(sectionSelector);

        // Configuration from element's attributes
        this.height = parseInt(this.element.getAttribute(TOGGLE_FADE_HEIGHT_ATTR) || '1000');
        this.bottomPadding = parseInt(this.element.getAttribute(TOGGLE_FADE_PADDING_ATTR) || '1000');
        this.transitionTimeMs = parseInt(this.element.getAttribute(TOGGLE_FADE_TRANSITION_TIME_ATTR) || '250');

        // Container will be what dictates the height so that all the styles applied to the
        // original element will continue to work.
        this.container.style.height = (this.children.length * this.height + this.bottomPadding) + 'px';
        this.container.style.position = 'relative';
        this.element.parentNode.insertBefore(this.container, this.element);
        this.container.appendChild(this.element);
        this.element.style.height = '100vh';

        _.forEach(this.children, function (child) {
            child.style.transitionDuration = this.transitionTimeMs + 'ms';
        }.bind(this));

        SevDesLib.distanceFromTopListener(this.checkScrollPosition.bind(this));

        this.checkScrollPosition(0);
    };

    ToggleFadeController.prototype.checkScrollPosition = function (scrollPosition) {
        var position = SevDesLib.getElementPosition(this.container);
        var activeChild;

        // If we're before the container
        if (position < 0) {
            this.element.style.position = 'absolute';
            this.element.style.top = '0';
            this.element.style.bottom = 'auto';
            activeChild = 0;
        }
        // If we're after the container
        else if (position > 1) {
            this.element.style.position = 'absolute';
            this.element.style.top = 'auto';
            this.element.style.bottom = '0';
            activeChild = this.children.length - 1;
        }
        // If we're in the middle of the container
        else {
            this.element.style.position = 'fixed';
            this.element.style.top = '0';
            this.element.style.bottom = 'auto';

            activeChild = Math.min(Math.floor(position * this.children.length), this.children.length - 1);
        }

        _.forEach(this.children, function (child, index) {
            if (activeChild === index) {
                this.fadeIn(child);
            }
            else {
                this.fadeOut(child);
            }
        }.bind(this));
    };

    ToggleFadeController.prototype.fadeIn = function (element) {
        element.style.opacity = '1';
        element.style.cursor = 'auto';
    };

    ToggleFadeController.prototype.fadeOut = function (element) {
        element.style.opacity = '0';
        element.style.cursor = 'default';
    };

    if (!SevDesLib.isMobile()){
        SevDesLib.createForEachElement(TOGGLE_FADE_ATTR, ToggleFadeController);
    }

    // CURTAIN LIFT
    // ============

    const CURTAIN_LIFT_ATTR = 'curtain-lift';
    const CURTAIN_Z_INDEX = 100;

    var CurtainLiftController = function (element) {
        var body = document.querySelectorAll('body')[0];

        this.curtain = element;

        // For fading in the content under the curtain
        var wrapperBgColor = this.curtain.getAttribute(CURTAIN_LIFT_ATTR) || 'transparent';
        this.curtainFade = document.createElement('DIV');
        this.curtainFade.style.background = wrapperBgColor;
        this.curtainFade.style.position = 'fixed';
        this.curtainFade.style.zIndex = CURTAIN_Z_INDEX - 1;
        this.curtainFade.style.width = '100vw';
        this.curtainFade.style.height = '100vh';
        this.curtainFade.style.top = '0';
        this.curtainFade.style.left = '0';
        body.appendChild(this.curtainFade);

        // Wrap all the non-curtain content so that it sticks to the top of the page when the
        // page loads.
        this.curtainWrapper = document.createElement('DIV');
        this.curtainWrapper.setAttribute('id', 'curtain-wrapper');
        body.appendChild(this.curtainWrapper);

        // Move every child into the wrapper
        _.forEach(body.childNodes, function (child) {
            if (child && child.tagName && child !== this.curtain && child !== this.curtainWrapper) {
                this.curtainWrapper.appendChild(child);
            }
        }.bind(this));

        SevDesLib.distanceFromTopListener(this.checkScrollPosition.bind(this));

        this.curtainWrapper.style.width = '100vw';
        this.curtainWrapper.style.zIndex = '0';
        this.curtain.style.position = 'relative';
        this.curtain.style.zIndex = CURTAIN_Z_INDEX;          
        this.checkScrollPosition(0);
    };

    CurtainLiftController.prototype.checkScrollPosition = function (scrollPosition) {
        var curtainOffsetHeight = this.curtain.offsetHeight;        
        if (scrollPosition + 1 < curtainOffsetHeight) {
            this.curtainWrapper.style.position = 'fixed';
            this.curtainWrapper.style.top = 0;

            this.curtain.style.marginBottom = '100vh';

            this.curtainFade.style.display = 'block';
            this.curtainFade.style.opacity = (curtainOffsetHeight - scrollPosition) / curtainOffsetHeight;
        }
        else {
            this.curtainFade.style.display = 'none';
            this.curtainWrapper.style.position = 'relative';
            this.curtain.style.marginBottom = '0';
        }
    };

    SevDesLib.createForEachElement(CURTAIN_LIFT_ATTR, CurtainLiftController);

    //

    window.SevDesLib = SevDesLib;
})();