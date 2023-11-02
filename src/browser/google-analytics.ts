/********************************************************************************
 * Copyright (C) 2023 Zhangyi
 ********************************************************************************/

import $ from 'jquery';

const googId = 'G-WQPMM44JGT';

export const googleScript = `
<script async src="https://www.googletagmanager.com/gtag/js?id=${googId}" id="${googId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config',"${googId}");
</script>
`;

export const addGoogleScript = (container: HTMLElement) => {
    if ($(container).has(`#${googId}`).length === 0) {
        $(container).append(googleScript);
    }
};
