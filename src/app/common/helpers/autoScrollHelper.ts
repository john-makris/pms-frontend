import { Event, NavigationEnd } from "@angular/router";

export function autoScroll(url: string, event: Event) {
    let element: any;
    if (event instanceof NavigationEnd) {
      if(url.includes('add') || url.includes('edit')) {
        element = document.getElementById('add/edit');
      } else if (url.includes('detail')) {
        element = document.getElementById('detail');
      } else if (url.includes('upload')) {
        element = document.getElementById('upload');
      } else {
        element = document.getElementById('list');
      }
      console.log("ELEMENT: "+element);
      if (element) {
          setTimeout(() => {
              element.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'nearest'});
          }, 500 );
      }
    }
}