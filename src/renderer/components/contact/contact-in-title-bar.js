import React from 'react'
import PropTypes from 'prop-types'

import ContentTypes from '../../content-types'
import Content from '../content'
import { createDocumentLink } from '../../share-link'
import { DEFAULT_AVATAR_PATH } from '../../constants'

class ContactInTitlebar extends React.PureComponent {
  static propTypes = {
    hypermergeUrl: PropTypes.string.isRequired,
    selfId: PropTypes.string.isRequired
  }

  state = {}

  // This is the New Boilerplate
  componentWillMount = () => {
    this.refreshHandle(this.props.hypermergeUrl)
    this.timerId = null
  }

  componentWillUnmount = () => {
    this.handle.close()
    clearTimeout(this.timerId)
  }

  componentDidUpdate = (prevProps, prevState, snapshot) => {
    if (prevProps.hypermergeUrl !== this.props.hypermergeUrl) {
      this.refreshHandle(this.props.hypermergeUrl)
    }
  }

  refreshHandle = (hypermergeUrl) => {
    if (this.handle) {
      this.handle.close()
    }
    this.handle = window.repo.watch(hypermergeUrl, (doc) => this.onChange(doc))
  } // onMessage!?


  onChange = (doc) => {
    if (this.props.selfId === this.props.hypermergeUrl) {
      this.setState({ online: true })
    }
    this.setState({ ...doc })
  }

  onMessage = ({ msg, peer }) => {
    clearTimeout(this.timerId)
    // if we miss two heartbeats (11s), assume they've gone offline
    this.timerId = setTimeout(() => {
      this.setState({ online: false })
    }, 11000)
    this.setState({ online: true })
  }

  onDragStart = (e) => {
    e.dataTransfer.setData(
      'application/pushpin-url',
      createDocumentLink('contact', this.props.hypermergeUrl)
    )
  }

  render = () => {
    let avatar
    if (this.state.avatarDocId) {
      avatar = <Content url={createDocumentLink('image', this.state.avatarDocId)} />
    } else {
      avatar = <img alt="avatar" src={DEFAULT_AVATAR_PATH} />
    }

    return (
      <div>
        <div
          draggable="true"
          onDragStart={this.onDragStart}
          className={`Avatar Avatar--title-bar ${this.state.online ? 'Avatar--online' : 'Avatar--offline'}`}
          style={{ '--highlight-color': this.state.color }}
          data-name={this.state.name}
        >
          { avatar }
        </div>
      </div>
    )
  }
}

ContentTypes.register({
  component: ContactInTitlebar,
  type: 'contact',
  context: 'title-bar',
  name: 'Avatar',
  icon: 'user',
  unlisted: true,
})