'use strict'

/* global notie */
import 'babel-polyfill'
import axios from 'axios'
import DOMPurify from 'dompurify'
import moment from 'moment'
import _ from 'lodash'

$(document).ready(removeOldBookmarksPageInit)

function removeOldBookmarksPageInit() {
  var csrfToken = $('#csrfInput').val()
  var rowsUl$ = $('#rowsUl')
  // buttonplate($('.deleteBookmark'))

  axios.post('/frontendapi/getMostRecentlyExpiredBookmarks/', null, {headers: {'X-CSRF-Token': csrfToken}})
    .then( response => {
      var rows = response.data

      rows.forEach(row => {
        /*****
         * If there's no pageTitle text, then just use the page url
         */
        var pageTitle = _.trim(_.get(row, 'pageTitle.length') ? row.pageTitle : row.pageUrl)
        rowsUl$.append(`
          <li class="bookmarkDetailsContainer">
            <div class="deleteBookmarkButtonContainer">
              <a href="${ DOMPurify.sanitize(row.pageUrl) }" class="deleteBookmarkButton button black square">Delete</a>
            </div>
            <div class="bookmarkDetails">
              <a href="${ DOMPurify.sanitize(row.pageUrl) }" target="_blank">${ DOMPurify.sanitize(pageTitle) }</a>
              <div class="bookmarkPageUrl">${ DOMPurify.sanitize(row.pageUrl) }</div>
              <div class="dateCreated">Date Created: ${ DOMPurify.sanitize(moment(row.dateCreated).format("dddd, MMMM Do YYYY, h:mm:ss a")) }</div>
            </div>
          </li>
        `)
      })

      $('.deleteBookmarkButton').click(event => {
        event.preventDefault()
        var currentElement = event.currentTarget
        var urlToDelete = encodeURIComponent($(currentElement).attr('href'))
        var elemBookmarkDetailsContainer = $(currentElement).parent().parent()
        axios.delete(`/frontendapi/remove/${ urlToDelete }`, {headers: {'X-CSRF-Token': csrfToken}})
          .then(() => {
            elemBookmarkDetailsContainer.animate({height: "toggle"}, 400, () => {
              elemBookmarkDetailsContainer.remove()
            })
          })
          .catch(err => {
            console.error(err)
            $('#notie-alert-outer').addClass('notie-alert-error')
            notie.alert(
              3,
              `There Was An Error Deleting The Bookmark
                Error: ${ err.message }`,
              5
            )
          })
      })

    })
    .catch( err => {
      console.error(err)
    })
}
