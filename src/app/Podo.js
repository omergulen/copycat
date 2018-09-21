/**
 * Import Podo Styles
 */
import './Podo.scss';

class Podo {

  /**
   * Constructor
   */
  constructor() {
    this.regexRule = /\d+$/;
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
    if (this.pathName.match(this.regexRule)) {
      this.formId = this.pathName.match(this.regexRule)[0];
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
        pattern: '/build/{formId}'
      },
      {
        name: 'preview',
        title: 'Preview',
        pattern: '/{formId}'
      },
      {
        name: 'submissions',
        title: 'Submissions',
        pattern: '/submissions/{formId}'
      },
      {
        name: 'sheets',
        title: 'Sheets',
        pattern: '/sheets/{formId}'
      },
      {
        name: 'pdf-designer',
        title: 'PDF Designer',
        pattern: '/pdf-designer/{formId}'
      }
    ];
  }

  /**
   * Set current path
   * @returns {boolean}
   */
  setCurrentPattern() {
    let pattern = this.pathName.replace(this.formId, '{formId}');
    let currentPattern = this.urlPatterns.find((item) => {
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
      return item.pattern !== this.currentPattern.pattern
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