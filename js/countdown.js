(function () {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // 页面上的所有时间文案均由 DATA 派生；改开服/停服时间只需改这里。
    const DATA = {
        checkedAt: "2026-11-10",
        chronicle: [
            {
                date: "2021-09-30T10:00:00+08:00",
                kind: "start",
                label: "公测开服",
                note: "国服全平台 10:00 正式公测。"
            },
            {
                date: "2022-03-30T00:00:00+08:00",
                label: "半周年",
                note: "公测半周年纪念，官方发布纪念动态。"
            },
            {
                date: "2022-09-30T00:00:00+08:00",
                label: "一周年",
                note: "公测一周年纪念，官方发布周年动态。"
            },
            {
                date: "2023-09-30T00:00:00+08:00",
                label: "二周年",
                note: "二周年活动自 9 月 26 日持续至 10 月 15 日。"
            },
            {
                date: "2024-09-30T00:00:00+08:00",
                label: "三周年",
                note: "9 月 30 日维护后开启三周年活动与版本内容。"
            },
            {
                date: "2025-09-30T00:00:00+08:00",
                label: "四周年",
                note: "9 月 30 日祈愿更新，10 月 10 日进行不停服版本更新。"
            },
            {
                date: "2026-09-30T00:00:00+08:00",
                label: "五周年",
                note: "最后一届周年庆，五周年纪念任务活动延续至 10 月中旬。"
            },
            {
                date: "2026-11-03T14:00:00+08:00",
                label: "停运公告",
                note: "14:00 起关闭充值入口与新角色创建功能，停运礼包在公告后 3 个工作日内发放至游戏邮箱。"
            },
            {
                date: "2027-02-03T14:00:00+08:00",
                kind: "deadline",
                label: "正式停运",
                note: "14:00 永久关闭游戏服务器，停运礼包领取截止。",
                emphasis: true
            },
            {
                date: "2027-03-03T14:00:00+08:00",
                label: "渠道关闭",
                note: "关闭游戏官网、官方论坛及客服渠道。"
            }
        ]
    };

    function entryOf(kind) {
        for (let i = 0; i < DATA.chronicle.length; i++) {
            if (DATA.chronicle[i].kind === kind) return DATA.chronicle[i];
        }
        return null;
    }

    // 测试开关：设为页面加载后 N 秒触发停服；0 表示使用 DATA 中的正式日期。
    const TEST_END_DELAY = 0;

    const START = new Date(entryOf("start").date).getTime();
    const DEADLINE = TEST_END_DELAY
        ? Date.now() + TEST_END_DELAY * 1000
        : new Date(entryOf("deadline").date).getTime();
    const TOTAL = DEADLINE - START;

    if (!(DEADLINE > START)) {
        console.warn("[countdown] DATA 中的停服时间必须晚于开服时间。");
    }
    DATA.chronicle.forEach(function (item, index) {
        const time = new Date(item.date).getTime();
        if (Number.isNaN(time)) {
            console.warn("[countdown] 无法解析编年史日期：", item.date, "（第 " + (index + 1) + " 条）");
        }
        if (index > 0 && time < new Date(DATA.chronicle[index - 1].date).getTime()) {
            console.warn("[countdown] 编年史未按时间升序排列：", item.date);
        }
    });

    let dateFormat = null;
    let timeFormat = null;
    try {
        dateFormat = new Intl.DateTimeFormat("zh-CN", {
            timeZone: "Asia/Shanghai",
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        });
        timeFormat = new Intl.DateTimeFormat("zh-CN", {
            timeZone: "Asia/Shanghai",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        });
    } catch (error) {
        dateFormat = null;
        timeFormat = null;
    }

    function formatDate(value) {
        if (!value) return "——";
        const date = value instanceof Date ? value : new Date(value);
        try {
            const parts = {};
            dateFormat.formatToParts(date).forEach(function (part) {
                parts[part.type] = part.value;
            });
            return parts.year + "." + parts.month + "." + parts.day;
        } catch (error) {
            const shifted = new Date(date.getTime() + 8 * 3600000);
            const month = String(shifted.getUTCMonth() + 1);
            const day = String(shifted.getUTCDate());
            return shifted.getUTCFullYear() + "." + (month.length < 2 ? "0" + month : month) + "." + (day.length < 2 ? "0" + day : day);
        }
    }

    function formatTime(value) {
        if (!value) return "--:--";
        const date = value instanceof Date ? value : new Date(value);
        try {
            const parts = {};
            timeFormat.formatToParts(date).forEach(function (part) {
                parts[part.type] = part.value;
            });
            return parts.hour + ":" + parts.minute;
        } catch (error) {
            const shifted = new Date(date.getTime() + 8 * 3600000);
            return pad(shifted.getUTCHours(), 2) + ":" + pad(shifted.getUTCMinutes(), 2);
        }
    }

    const eventsEl = document.getElementById("events");
    DATA.chronicle.forEach(function (item) {
        const event = document.createElement("li");
        event.className = "event";
        if (item.emphasis) event.classList.add("is-key");

        const dateEl = document.createElement("span");
        dateEl.className = "event-date";
        dateEl.textContent = formatDate(item.date);

        const markerEl = document.createElement("span");
        markerEl.className = "event-marker";

        const bodyEl = document.createElement("div");
        bodyEl.className = "event-body";

        const labelEl = document.createElement("span");
        labelEl.className = "event-label";
        labelEl.textContent = item.label;
        bodyEl.appendChild(labelEl);

        if (item.note) {
            const noteEl = document.createElement("p");
            noteEl.className = "event-note";
            noteEl.textContent = item.note;
            bodyEl.appendChild(noteEl);
        }

        event.append(dateEl, markerEl, bodyEl);
        eventsEl.appendChild(event);
    });

    const events = Array.prototype.slice.call(eventsEl.children);
    const nodeTimes = DATA.chronicle.map(function (item) {
        return item.date ? new Date(item.date).getTime() : NaN;
    });

    const daysEl = document.getElementById("days");
    const hoursEl = document.getElementById("hours");
    const minutesEl = document.getElementById("minutes");
    const secondsEl = document.getElementById("seconds");
    const tMinusEl = document.getElementById("tMinus");
    const progressBar = document.getElementById("progressBar");
    const progressHead = document.getElementById("progressHead");
    const progressText = document.getElementById("progressText");
    const progressTrack = document.getElementById("progressTrack");
    const beam = document.getElementById("beam");
    const beamHead = document.getElementById("beamHead");
    const nowDate = document.getElementById("nowDate");

    const deadlineDateText = formatDate(DEADLINE);
    const deadlineTimeText = formatTime(DEADLINE);
    const closedNotice = "东方归言录国服已于 " + deadlineDateText + " " + deadlineTimeText + " 停止服务。";

    function setText(id, text) {
        document.getElementById(id).textContent = text;
    }

    setText("deadlineDate", deadlineDateText);
    setText("deadlineTime", deadlineTimeText + " UTC+08:00");
    setText("scaleStart", formatDate(START));
    setText("scaleEnd", deadlineDateText);
    setText("eventDate", deadlineDateText);
    setText("eventTime", deadlineTimeText);
    setText("epilogueDate", deadlineDateText);
    setText("epilogueTime", deadlineTimeText);
    setText("verifiedDate", formatDate(DATA.checkedAt));
    setText("statusUpcoming", "东方归言录国服将于 " + deadlineDateText + " " + deadlineTimeText + " 停止服务。页面所显示时间以北京时间（UTC+08:00）为准。");
    setText("statusEnded", closedNotice);

    let markerYs = [];
    let ended = false;
    let timer = null;

    function pad(value, length) {
        return String(value).padStart(length, "0");
    }

    function updateTimeline(now) {
        if (!markerYs.length) return;

        const points = [];
        nodeTimes.forEach(function (time, index) {
            if (!Number.isNaN(time)) {
                points.push({ time: time, y: markerYs[index] });
            }
        });
        if (!points.length) return;

        const first = points[0];
        const last = points[points.length - 1];
        let endY = first.y;

        if (now >= last.time) {
            endY = last.y;
        } else if (now > first.time) {
            for (let i = 0; i < points.length - 1; i++) {
                if (now >= points[i].time && now < points[i + 1].time) {
                    const step = (now - points[i].time) / (points[i + 1].time - points[i].time);
                    endY = points[i].y + (points[i + 1].y - points[i].y) * step;
                    break;
                }
            }
        }

        beam.style.top = first.y + "px";
        beam.style.height = Math.max(0, endY - first.y) + "px";
        beamHead.style.top = endY + "px";

        events.forEach(function (event, index) {
            event.classList.toggle("is-passed", !Number.isNaN(nodeTimes[index]) && nodeTimes[index] <= now);
        });
    }

    function measureTimeline() {
        markerYs = events.map(function (event) {
            const marker = event.querySelector(".event-marker");
            return event.offsetTop + marker.offsetTop + marker.offsetHeight / 2;
        });
        updateTimeline(Date.now());
    }

    function syncScrolled() {
        document.body.classList.toggle("is-scrolled", window.scrollY > window.innerHeight * 0.15);
    }

    function tick() {
        const now = Date.now();
        const distance = Math.max(0, DEADLINE - now);
        const days = Math.floor(distance / 86400000);
        const hours = Math.floor((distance % 86400000) / 3600000);
        const minutes = Math.floor((distance % 3600000) / 60000);
        const seconds = Math.floor((distance % 60000) / 1000);
        const progress = Math.min(100, Math.max(0, ((now - START) / TOTAL) * 100));

        daysEl.textContent = pad(days, 3);
        hoursEl.textContent = pad(hours, 2);
        minutesEl.textContent = pad(minutes, 2);
        secondsEl.textContent = pad(seconds, 2);
        tMinusEl.textContent = "T− " + pad(days, 3) + "D " + pad(hours, 2) + ":" + pad(minutes, 2) + ":" + pad(seconds, 2);

        progressBar.style.width = progress.toFixed(2) + "%";
        progressHead.style.left = progress.toFixed(2) + "%";
        progressText.textContent = progress.toFixed(1) + "%";
        progressTrack.setAttribute("aria-valuenow", String(Math.round(progress)));

        nowDate.textContent = formatDate(now);
        updateTimeline(now);
        syncScrolled();

        if (distance === 0 && !ended) {
            ended = true;
            document.body.classList.add("is-ended");
            document.getElementById("statusUpcoming").setAttribute("aria-hidden", "true");
            document.getElementById("statusEnded").removeAttribute("aria-hidden");
            window.dispatchEvent(new Event("service-ended"));
            if (timer) clearInterval(timer);
        }
    }

    if (reduceMotion || typeof IntersectionObserver !== "function") {
        events.forEach(function (event) {
            event.classList.add("is-in");
        });
    } else {
        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-in");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: "0px 0px -10% 0px" });

        events.forEach(function (event) {
            observer.observe(event);
        });
    }

    const scrollHint = document.querySelector(".scroll-hint");
    if (scrollHint && !("scrollBehavior" in document.documentElement.style) && !reduceMotion) {
        scrollHint.addEventListener("click", function (event) {
            const target = document.querySelector(scrollHint.getAttribute("href"));
            if (!target) return;
            event.preventDefault();
            const startY = window.pageYOffset || document.documentElement.scrollTop;
            const distance = target.getBoundingClientRect().top;
            const duration = 500;
            const started = Date.now();
            function step() {
                const progress = Math.min(1, (Date.now() - started) / duration);
                const eased = progress < 0.5
                    ? 2 * progress * progress
                    : 1 - Math.pow(-2 * progress + 2, 2) / 2;
                window.scrollTo(0, startY + distance * eased);
                if (progress < 1) requestAnimationFrame(step);
            }
            requestAnimationFrame(step);
        });
    }

    let resizeTimer;
    window.addEventListener("resize", function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(measureTimeline, 150);
    });
    window.addEventListener("scroll", syncScrolled, { passive: true });
    window.addEventListener("load", measureTimeline);
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(measureTimeline);
    }

    tick();
    measureTimeline();
    if (!ended) timer = setInterval(tick, 1000);
})();
