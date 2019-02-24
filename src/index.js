import ifIsImage from 'if-is-image';
import tocbot from 'tocbot';
import gql from 'graphql-tag';
// graphql.js docs https://graphql.org/graphql-js/graphql/
// import { request, GraphQLClient } from 'graphql-request'
// const client = graphql("https://public.yetibot.com/graphql");
import ApolloClient from "apollo-boost";

const endpoint = "https://public.yetibot.com/graphql";
const client = new ApolloClient({uri: endpoint});

// TOC interactive
tocbot.init({
  tocSelector: '.toc .content',
  contentSelector: '.page-content',
  // Which headings to grab inside of the contentSelector element.
  headingSelector: 'h1, h2, h3, h4'
});

const toc = document.querySelector('.toc.column .content');
toc.classList.add('ready');
console.log(toc);

let lastScrollY = 0;
const fixedTOCThreshold = 208;

window.addEventListener('scroll', function(e) {
  // add fixed
  if (
    toc &&
    (lastScrollY <= fixedTOCThreshold || !lastScrollY) &&
    window.scrollY > fixedTOCThreshold
  ) {
    // console.log('add fixed', toc);
    toc.classList.add('fixed');
  }

  // remove fixed
  if (
    toc &&
    (lastScrollY >= fixedTOCThreshold || !lastScrollY) &&
    window.scrollY < fixedTOCThreshold
  ) {
    // console.log('remove fixed', toc);
    toc.classList.remove('fixed');
  }

  lastScrollY = window.scrollY;
});

// Eval against Yetibot GraphQL

const evalQuery = gql`
  query EvalQuery($expr: String!) {
    eval(expr: $expr)
  }
`;

export const yetibotEval = function(expr) {
  console.log('eval', evalQuery, {expr});
  // '{eval(expr: "' + escape(expr) + '")}'
  // const result = client.request(evalQuery, {expr});
  return client.query({query: evalQuery, fetchPolicy: 'no-cache', variables: {expr}});
};


// Either prints raw text or images depending on url structure
const appendResult = async (response, node) => {
  // console.log(node, typeof(node), 'result', response, ifIsImage(response));
  if (ifIsImage(response)) {
    const img = document.createElement("img");
    img.src = response;
    node.appendChild(img);
  } else {
    node.append(response + '\n')
  }
};

// Init
document.addEventListener('DOMContentLoaded', function () {

  const codeBlocks = document.querySelectorAll('code.yetibot');
  codeBlocks.forEach(function(codeBlock) {

    const expr = codeBlock.textContent.trim().replace(/^!/, "");
    const runButton = document.createElement('a');
    runButton.setAttribute("class", "eval-button button is-info is-pulled-right");
    runButton.appendChild(document.createTextNode("Run"));
    runButton.onclick = function(e) {
      console.log('clicked', expr);
      const result = yetibotEval(expr);
      result.then(function(response) {
        console.log('result', response.data.eval);
        response.data.eval.forEach(e => appendResult(e, codeBlock));
      }).catch(function(err) {
        console.warn('error from graphql evaluating expression:', expr, err);
      });
      return false;
    };

    // use parentElement because the <code> is wrapped in a <pre>
    codeBlock.parentElement.insertAdjacentElement(
      "afterend", runButton);

    // console.log('yetibot code block', codeBlock, expr);
  });
});


// Bulma Menu JS
document.addEventListener('DOMContentLoaded', function () {
  // Get all "navbar-burger" elements
  var $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);
  // Check if there are any navbar burgers
  if ($navbarBurgers.length > 0) {
    // Add a click event on each of them
    $navbarBurgers.forEach(function ($el) {
      $el.addEventListener('click', function () {
        // Get the target from the "data-target" attribute
        var target = $el.dataset.target;
        var $target = document.getElementById(target);
        // Toggle the class on both the "navbar-burger" and the "navbar-menu"
        $el.classList.toggle('is-active');
        $target.classList.toggle('is-active');
      });
    });
  }
});
