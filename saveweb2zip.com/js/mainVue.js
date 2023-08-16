// eslint-disable-next-line no-undef,no-unused-vars
const app = new Vue({
  el: '#app',
  data: {
    popupType: null,
    popupTitle: window.popupSuccessTitle,
    isPopupActive: false,
    integrationsData: window.integrationsData,
    isActiveRequest: false,
    confirmLanguages: ['RU', 'EN', 'BG', 'CZ', 'DE', 'ES', 'GR', 'HU', 'ID', 'IT', 'PL', 'PT', 'RO', 'RS', 'SK', 'TH', 'TR', 'VN'],
    formOptions: {
      websiteLink: null,
      isIntegration: false,
      selectedIntegration: 'email',
      intagrationData: {},
      isLandUnique: false,
      isAllPageDownload: false,
      confirmLanguage: 'RU',
      isMobileVersion: false,
      isDefaultDownload: false,
    },
    downloadedFiles: 0,
  },
  methods: {
    download(filename, url) {
      const element = document.createElement('a');
      element.setAttribute('href', url);
      element.setAttribute('download', filename);

      element.style.display = 'none';
      document.body.appendChild(element);

      element.click();

      document.body.removeChild(element);
    },
    checkProgress() {
      const http = new XMLHttpRequest();
      const url = `./api/checkProgress?formOptions=${encodeURIComponent(JSON.stringify(this.formOptions))}`;

      http.open('GET', url, true);
      http.setRequestHeader(
        'Content-type',
        'application/x-www-form-urlencoded',
      );

      http.onreadystatechange = () => {
        if (http.readyState === 4 && http.status === 200) {
          const data = JSON.parse(http.response);

          const numberAnimation = setInterval(() => {
            if (this.downloadedFiles < data.files) {
              this.downloadedFiles += 1;
            } else {
              clearInterval(numberAnimation);
            }
          }, 10);

          if (!data.url) {
            setTimeout(() => {
              this.checkProgress();
            }, 1500);
          } else {
            this.download(
              'SaveWeb2ZIP.zip',
              data.url,
            );
            // eslint-disable-next-line no-undef
            gtag('event', 'download-webpage', {
              url: '',
            });
            this.popupTitle = window.popupSuccessTitle;
            this.popupType = 'downloadSuccess';
            this.isPopupActive = true;
            this.isActiveRequest = false;
            this.downloadedFiles = data.files;
          }
        } else if (http.readyState === 4 && http.status === 404) {
          this.popupTitle = window.popupDeclineTitle;
          this.popupType = 'downloadDecline';
          this.isPopupActive = true;
          this.isActiveRequest = false;
          this.downloadedFiles = 0;
        }
      };

      http.send(null);
    },
    submitForm(evt) {
      evt.preventDefault();

      const http = new XMLHttpRequest();
      const url = `./api/landscrape?formOptions=${encodeURIComponent(JSON.stringify(this.formOptions))}`;

      http.open('GET', url, true);
      http.setRequestHeader(
        'Content-type',
        'application/x-www-form-urlencoded',
      );
      http.responseType = 'blob';
      http.onreadystatechange = () => {
        if (http.readyState === 4 && http.status === 200) {
          this.checkProgress();
        } else if (http.readyState === 4 && http.status === 404) {
          this.popupTitle = window.popupDeclineTitle;
          this.popupType = 'downloadDecline';
          this.isPopupActive = true;
          this.isActiveRequest = false;
        }
      };
      http.send(null);
      this.downloadedFiles = 0;
      this.isActiveRequest = true;
    },
    openFormPopup(evt) {
      evt.preventDefault();

      this.popupType = 'form';
      this.popupTitle = window.popupFormTitle;
      this.isPopupActive = true;
    },
    successFormPopup(evt) {
      evt.preventDefault();

      this.isPopupActive = false;
      this.formOptions.isIntegration = true;
    },
    declineFormPopup(evt) {
      evt.preventDefault();

      this.isPopupActive = false;
      this.formOptions.isIntegration = false;
    },
    closePopup(evt) {
      evt.preventDefault();
      this.isPopupActive = false;
      // eslint-disable-next-line no-self-assign
      this.formOptions.isIntegration = this.formOptions.isIntegration;
    },
    isUrlValid(url) {
      return /^https?:\/\/.*/g.test(url);
    },
    isOnionDomain(url) {
      return /.onion$|.onion\//g.test(url);
    },
    onChangeUrl(evt) {
      if (!this.isUrlValid(this.formOptions.websiteLink)
        || this.formOptions.websiteLink.length === 0
        || this.isOnionDomain(this.formOptions.websiteLink)) {
        evt.target.setCustomValidity(window.incorrectLink);
      } else {
        evt.target.setCustomValidity('');
      }
    },
    onChangeLang(evt) {
      const currentPage = window.location.href;
      const targetLang = evt.target.value;
      const targetPage = currentPage.substring(0, currentPage.length - 2);

      window.location.href = targetPage + targetLang;
    },
  },
});
