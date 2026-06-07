(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
      return;
    }

    fn();
  }

  function compactWhitespace(value) {
    return value.replace(/\s+/g, " ").trim();
  }

  function makeExcerpt(body, terms) {
    var text = compactWhitespace(body || "");

    if (!text) {
      return "";
    }

    var lower = text.toLowerCase();
    var matchIndex = -1;
    var i;

    for (i = 0; i < terms.length; i += 1) {
      matchIndex = lower.indexOf(terms[i]);

      if (matchIndex !== -1) {
        break;
      }
    }

    if (matchIndex === -1) {
      return text.slice(0, 120) + (text.length > 120 ? "..." : "");
    }

    var start = Math.max(0, matchIndex - 45);
    var end = Math.min(text.length, matchIndex + 95);
    var excerpt = text.slice(start, end);

    if (start > 0) {
      excerpt = "..." + excerpt;
    }

    if (end < text.length) {
      excerpt += "...";
    }

    return excerpt;
  }

  ready(function () {
    var form = document.querySelector(".search-form");
    var input = document.getElementById("nav-search");
    var panel = document.getElementById("nav-search-results");

    if (!form || !input || !panel || !window.elasticlunr || !window.searchIndex) {
      return;
    }

    var status = panel.querySelector(".search-results-status");
    var list = panel.querySelector(".search-results-list");
    var index = window.elasticlunr.Index.load(window.searchIndex);
    var docs = (window.searchIndex.documentStore && window.searchIndex.documentStore.docs) || {};
    var activeIndex = -1;
    var visibleLinks = [];
    var searchTimer = null;

    function setExpanded(isExpanded) {
      input.setAttribute("aria-expanded", isExpanded ? "true" : "false");
    }

    function clearActiveLink() {
      visibleLinks.forEach(function (link) {
        link.classList.remove("is-active");
      });

      activeIndex = -1;
      input.removeAttribute("aria-activedescendant");
    }

    function closePanel() {
      panel.hidden = true;
      setExpanded(false);
      clearActiveLink();
    }

    function openPanel() {
      panel.hidden = false;
      setExpanded(true);
    }

    function setStatus(message) {
      status.textContent = message;
    }

    function renderResults(results, terms) {
      list.textContent = "";
      visibleLinks = [];
      clearActiveLink();

      if (!results.length) {
        setStatus("No results");
        openPanel();
        return;
      }

      setStatus(results.length === 1 ? "1 result" : results.length + " results");

      results.forEach(function (result, resultIndex) {
        var doc = docs[result.ref];

        if (!doc) {
          return;
        }

        var item = document.createElement("li");
        var link = document.createElement("a");
        var title = document.createElement("span");
        var url = document.createElement("span");
        var excerpt = document.createElement("span");

        link.className = "search-result-link";
        link.href = doc.id || result.ref;
        link.id = "nav-search-result-" + resultIndex;

        title.className = "search-result-title";
        title.textContent = doc.title || doc.id || result.ref;

        url.className = "search-result-url";
        url.textContent = doc.id || result.ref;

        excerpt.className = "search-result-excerpt";
        excerpt.textContent = makeExcerpt(doc.body || "", terms);

        link.appendChild(title);
        link.appendChild(url);

        if (excerpt.textContent) {
          link.appendChild(excerpt);
        }

        item.appendChild(link);
        list.appendChild(item);
        visibleLinks.push(link);
      });

      openPanel();
    }

    function runSearch() {
      var query = compactWhitespace(input.value);

      if (!query) {
        closePanel();
        list.textContent = "";
        setStatus("");
        return;
      }

      var terms = query.toLowerCase().split(" ");
      var results = index.search(query, {
        bool: "OR",
        expand: true,
        fields: {
          title: { boost: 3 },
          body: { boost: 1 }
        }
      }).slice(0, 5);

      renderResults(results, terms);
    }

    function moveActive(step) {
      if (!visibleLinks.length) {
        return;
      }

      if (activeIndex === -1) {
        activeIndex = step > 0 ? 0 : visibleLinks.length - 1;
      } else {
        activeIndex = (activeIndex + step + visibleLinks.length) % visibleLinks.length;
      }

      visibleLinks.forEach(function (link, indexValue) {
        link.classList.toggle("is-active", indexValue === activeIndex);
      });

      var activeLink = visibleLinks[activeIndex];

      input.setAttribute("aria-activedescendant", activeLink.id);
      activeLink.scrollIntoView({ block: "nearest" });
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      if (!visibleLinks.length) {
        return;
      }

      window.location.href = visibleLinks[activeIndex === -1 ? 0 : activeIndex].href;
    });

    input.addEventListener("input", function () {
      window.clearTimeout(searchTimer);
      searchTimer = window.setTimeout(runSearch, 80);
    });

    input.addEventListener("keydown", function (event) {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        moveActive(1);
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        moveActive(-1);
        return;
      }

      if (event.key === "Escape") {
        closePanel();
        return;
      }

      if (event.key === "Enter" && visibleLinks.length) {
        event.preventDefault();
        window.location.href = visibleLinks[activeIndex === -1 ? 0 : activeIndex].href;
      }
    });

    input.addEventListener("focus", function () {
      if (list.children.length) {
        openPanel();
      }
    });

    document.addEventListener("click", function (event) {
      if (!form.contains(event.target)) {
        closePanel();
      }
    });
  });
}());
