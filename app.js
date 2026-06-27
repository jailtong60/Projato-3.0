class ContactForm {
    constructor() {
        this.form = document.getElementById("formContato");
        if (!this.form) return;

        this.status = document.getElementById("status");
        this.btnSubmit = this.form.querySelector("button[type='submit']");
        this.apiUrl = this.getApiUrl();
        this.requestTimeout = 8000;
        this.init();
    }

    getApiUrl() {
        const isProduction = window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1";
        return isProduction
            ? `${window.location.protocol}//${window.location.host}/contato`
            : "http://localhost:5500/contato";
    }

    init() {
        this.form.addEventListener("submit", (e) => this.handleSubmit(e));
        this.setupInputValidation();
    }

    setupInputValidation() {
        const inputs = this.form.querySelectorAll("input, textarea");
        inputs.forEach(input => {
            input.addEventListener("change", () => this.validateInput(input));
            input.addEventListener("blur", () => this.validateInput(input));
        });
    }

    validateInput(input) {
        if (input.type === "email") {
            const isValid = this.isValidEmail(input.value.trim());
            input.setAttribute("aria-invalid", String(!isValid && input.value !== ""));
        }
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
    }

    validateForm() {
        const nome = this.form.nome?.value.trim() || "";
        const email = this.form.email?.value.trim() || "";
        const mensagem = this.form.mensagem?.value.trim() || "";

        if (!nome || !email || !mensagem) return this.fail("❌ Preencha todos os campos obrigatórios");
        if (nome.length > 100) return this.fail("❌ Nome muito longo (máximo 100 caracteres)");
        if (!this.isValidEmail(email)) return this.fail("❌ E-mail inválido");
        if (mensagem.length < 10) return this.fail("❌ Mensagem muito curta (mínimo 10 caracteres)");
        if (mensagem.length > 5000) return this.fail("❌ Mensagem muito longa (máximo 5000 caracteres)");

        return { nome, email, mensagem };
    }

    fail(message) {
        this.showStatus(message, "error");
        return null;
    }

    showStatus(message, type) {
        if (!this.status) return;
        this.status.textContent = message;
        this.status.setAttribute("role", "alert");
        this.status.setAttribute("aria-live", type === "error" ? "assertive" : "polite");
        this.status.className = type;

        if (type === "success") {
            setTimeout(() => { this.status.textContent = ""; }, 5000);
        }
    }

    disableSubmit() {
        if (!this.btnSubmit) return;
        this.btnSubmit.disabled = true;
        this.btnSubmit.setAttribute("aria-busy", "true");
        this.btnSubmit.textContent = "📤 Enviando...";
    }

    enableSubmit() {
        if (!this.btnSubmit) return;
        this.btnSubmit.disabled = false;
        this.btnSubmit.setAttribute("aria-busy", "false");
        this.btnSubmit.textContent = "Enviar Mensagem";
    }

    async handleSubmit(e) {
        e.preventDefault();
        const dados = this.validateForm();
        if (!dados) return;
        this.disableSubmit();

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);
            const response = await fetch(this.apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dados),
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            await this.handleResponse(response);
        } catch (error) {
            if (error.name === "AbortError") this.showStatus("❌ Requisição expirou. Tente novamente.", "error");
            else if (error instanceof TypeError) this.showStatus("❌ Erro de conexão. Verifique sua internet ou o servidor.", "error");
            else this.showStatus("❌ Erro ao enviar mensagem. Tente novamente.", "error");
            console.error("Erro na requisição:", error);
        } finally {
            this.enableSubmit();
        }
    }

    async handleResponse(response) {
        try {
            const dados = await response.json();
            if (response.ok && dados.sucesso) {
                this.showStatus("✅ Mensagem enviada com sucesso!", "success");
                this.form.reset();
                return;
            }
            const msg = dados.erro || "Erro desconhecido. Tente novamente.";
            this.showStatus(`${response.status === 429 ? "⏱️" : "❌"} ${msg}`, response.status === 429 ? "warning" : "error");
        } catch {
            this.showStatus("❌ Erro ao processar resposta do servidor.", "error");
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new ContactForm();

    const menuBtn = document.getElementById("menuBtn");
    const menu = document.getElementById("menu");
    if (menuBtn && menu) {
        menuBtn.addEventListener("click", () => {
            menu.classList.toggle("active");
            const expanded = menu.classList.contains("active");
            menuBtn.setAttribute("aria-expanded", String(expanded));
        });
    }

    const reveals = document.querySelectorAll(".reveal");
    const reveal = () => {
        reveals.forEach((element) => {
            if (element.getBoundingClientRect().top < window.innerHeight - 100) {
                element.classList.add("active");
            }
        });
    };
    window.addEventListener("scroll", reveal, { passive: true });
    reveal();

    const header = document.querySelector("header");
    if (header) {
        const updateHeader = () => header.classList.toggle("scrolled", window.scrollY > 40);
        window.addEventListener("scroll", updateHeader, { passive: true });
        updateHeader();
    }
});

window.addEventListener("load", () => {
    const loader = document.querySelector(".loader");
    if (loader) setTimeout(() => loader.classList.add("hide"), 900);
});

const cursor = document.querySelector(".cursor");
const blur = document.querySelector(".cursor-blur");
if (cursor && blur) {
    document.addEventListener("mousemove", (e) => {
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
        blur.style.left = `${e.clientX}px`;
        blur.style.top = `${e.clientY}px`;
    });
}

if (typeof particlesJS === "function" && document.getElementById("particles-js")) {
    particlesJS("particles-js", {
        particles: {
            number: { value: 80 },
            color: { value: ["#1E8BC3", "#5A9E1A"] },
            opacity: { value: 0.3 },
            size: { value: 3 },
            line_linked: { enable: true, opacity: 0.15, color: "#1E8BC3" },
            move: { speed: 1.2 }
        }
    });
}

if (typeof gsap !== "undefined") {
    if (typeof ScrollTrigger !== "undefined") gsap.registerPlugin(ScrollTrigger);
    gsap.from(".title-anim", { y: 120, opacity: 0, duration: 1.5, ease: "power4.out" });
    gsap.from(".intro", { y: 80, opacity: 0, duration: 1.5, delay: 0.2, ease: "power4.out" });
}
