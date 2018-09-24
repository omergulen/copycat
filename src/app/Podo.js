/**
 * Import Podo Styles
 */
import './Podo.scss';

class Podo {

  /**
   * Constructor
   */
  constructor() {
    this.regexRule = /\d+/g;
    this.location = window.location;
  }

  /**
   * Init Podo
   */
  start() {
    this.setLocation();
    if (this.setFormId()) {
      this.setUrlPatterns();
      if (this.setCurrentPattern()) {
        this.render();
      } else {
        console.log('Pattern not found!');
      }
    } else {
      console.log('Form ID not found!');
    }

  }


  /**
   * Check current page contains a valid form id and set
   * @returns {boolean}
   */
  setFormId() {
    this.matches = this.pathName.match(this.regexRule);
    if (this.matches) {
      if (this.matches.length < 2) {
        this.formId = this.matches[0];
      } else {

        this.formId = this.matches[0];
        this.viewId = this.matches[1];
      }
      return true;
    } else {
      return false;
    }
  }

  /**
   * Set window location variables
   */
  setLocation() {
    this.location = window.location;
    this.pathName = this.location.pathname;
    if (this.pathName.slice(-1) === '/') {
      this.pathName = this.pathName.slice(0, -1);
    }
  }

  /**
   * Define patterns will be appeared podo action
   */
  setUrlPatterns() {
    this.urlPatterns = [
      {
        name: 'builder',
        title: 'Builder',
        pattern: '/build/{formId}',
        render: true
      },
      {
        name: 'preview',
        title: 'Preview',
        pattern: '/{formId}',
        render: true
      },
      {
        name: 'submissions',
        title: 'Submissions',
        pattern: '/submissions/{formId}',
        render: true
      },
      {
        name: 'sheets',
        title: 'Sheets',
        pattern: '/sheets/{formId}',
        render: true
      },
      {
        name: 'sheets',
        title: 'Sheets',
        pattern: '/sheets/{formId}/{viewId}',
        render: false
      },
      {
        name: 'sheets',
        title: 'Sheets',
        pattern: '/sheets/{formId}/unread',
        render: false
      },
      {
        name: 'pdf-designer',
        title: 'PDF Designer',
        pattern: '/pdf-designer/{formId}',
        render: true
      }
    ];
  }

  /**
   * Set current path
   * @returns {boolean}
   */
  setCurrentPattern() {
    let pattern;
    if (this.matches.length < 2) {
      pattern = this.pathName.replace(this.formId, '{formId}');
    } else {
      pattern = this.pathName.replace(this.formId, '{formId}');
      pattern = pattern.replace(this.viewId, '{viewId}');
    }
    let currentPattern = this.urlPatterns.find((item) => {
      console.log(item.pattern, pattern);
      return item.pattern === pattern
    });
    if (currentPattern) {
      this.currentPattern = currentPattern;
      return true;
    }
    return false;
  }

  /**
   * Exclude current path from url patterns
   * @returns {T[]}
   */
  buttonsWillBeRendered() {
    return this.urlPatterns.filter((item) => {
      return item.name !== this.currentPattern.name && item.render
    });
  }

  /**
   * Render a podo action
   * @param pattern
   * @returns {HTMLElement}
   */
  renderButton(pattern) {
    const url = `${window.location.protocol}//${window.location.hostname}${pattern.pattern.replace('{formId}', this.formId)}`;

    let button = document.createElement('div');
    button.classList.add('podo-action');

    let anchor = document.createElement('a');
    anchor.href = url;
    anchor.target = '_blank';

    let podo = document.createElement('img');
    podo.src = 'https://www.jotform.com/wepay/assets/img/podo.png?v=0.282';
    podo.classList.add('podo-icon');

    let title = document.createElement('strong');
    title.innerText = pattern.title;

    anchor.appendChild(podo);
    anchor.appendChild(title);
    button.appendChild(anchor);

    return button;


  }

  /**
   * Render all podo actions
   */
  render() {
    let podo = document.createElement('div');
    podo.classList.add('podo-actions');
    this.buttonsWillBeRendered().forEach((item) => {
      podo.appendChild(this.renderButton(item));
    });
    document.body.appendChild(podo);
  }

}

export default Podo;