// @flow
import { remote } from 'electron';
import fs from 'fs';
import React, { Component } from 'react';
import log from 'electron-log';
import NavBar from './NavBar';
import Redirector from './Redirector';
import {
  config,
  session,
  directories,
  eventEmitter,
  savedInInstallDir,
  il8n
} from '../index';

type Props = {};

type State = {
  darkMode: boolean
};

export default class Send extends Component<Props, State> {
  props: Props;

  state: State;

  constructor(props?: Props) {
    super(props);
    this.state = {
      darkMode: session.darkMode
    };
  }

  componentDidMount() {}

  componentWillUnmount() {}

  handleSubmit(event: any) {
    // We're preventing the default refresh of the page that occurs on form submit
    event.preventDefault();

    const spendKey = event.target[0].value;
    const viewKey = event.target[1].value;
    let height = event.target[2].value;

    if (viewKey === undefined || spendKey === undefined) {
      return;
    }
    if (height === '') {
      height = '0';
    }
    const options = {
      defaultPath: remote.app.getPath('documents')
    };
    const savePath = remote.dialog.showSaveDialog(null, options);
    if (savePath === undefined) {
      return;
    }
    session.saveWallet(session.walletFile);
    if (savedInInstallDir(savePath)) {
      remote.dialog.showMessageBox(null, {
        type: 'error',
        buttons: [il8n.ok],
        title: il8n.import_save_wallet_title,
        message: il8n.import_save_wallet_message
      });
      return;
    }
    const importedSuccessfully = session.handleImportFromKey(
      viewKey,
      spendKey,
      savePath,
      parseInt(height, 10)
    );
    if (importedSuccessfully === true) {
      remote.dialog.showMessageBox(null, {
        type: 'info',
        buttons: [il8n.ok],
        title: il8n.import_import_wallet_title,
        message: il8n.import_import_wallet_message
      });
      const programDirectory = directories[0];
      const modifyConfig = config;
      modifyConfig.walletFile = savePath;
      log.debug(`Set new config filepath to: ${modifyConfig.walletFile}`);
      config.walletFile = savePath;
      fs.writeFileSync(
        `${programDirectory}/config.json`,
        JSON.stringify(config, null, 4),
        err => {
          if (err) throw err;
          log.debug(err);
        }
      );
      log.debug('Wrote config file to disk.');
      eventEmitter.emit('initializeNewSession');
    } else {
      remote.dialog.showMessageBox(null, {
        type: 'error',
        buttons: [il8n.ok],
        title: il8n.import_import_wallet_error_title,
        message: il8n.import_import_wallet_error_message
      });
    }
  }

  render() {
    const { darkMode } = this.state;

    return (
      <div>
        <Redirector />
        {darkMode === false && (
          <div className="wholescreen">
            <NavBar />
            <div className="maincontent">
              <form onSubmit={this.handleSubmit}>
                <div className="field">
                  <label className="label" htmlFor="scanheight">
                    {il8n.private_spend_key}
                    <div className="control">
                      <input
                        className="input is-large"
                        type="text"
                        placeholder={il8n.private_spend_key_input_placeholder}
                        id="scanheight"
                      />
                    </div>
                  </label>
                </div>
                <div className="field">
                  <label className="label" htmlFor="scanheight">
                    {il8n.private_view_key}
                    <div className="control">
                      <input
                        className="input is-large"
                        type="text"
                        placeholder={il8n.private_view_key_input_placeholder}
                        id="scanheight"
                      />
                    </div>
                  </label>
                </div>
                <div className="field">
                  <label className="label" htmlFor="scanheight">
                    {il8n.scan_height}
                    <div className="control">
                      <input
                        className="input is-large"
                        type="text"
                        placeholder={il8n.scan_height_input_placeholder}
                        id="scanheight"
                      />
                    </div>
                  </label>
                </div>
                <div className="buttons">
                  <button type="submit" className="button is-success is-large ">
                    {il8n.import}
                  </button>
                  <button type="reset" className="button is-large">
                    {il8n.clear}
                  </button>
                </div>
              </form>
            </div>
            <div className="footerbar has-background-light" />
          </div>
        )}
        {darkMode === true && (
          <div className="wholescreen has-background-dark">
            <NavBar />
            <div className="maincontent has-background-dark">
              <form onSubmit={this.handleSubmit}>
                <div className="field">
                  <label className="label has-text-white" htmlFor="scanheight">
                    {il8n.private_spend_key}
                    <div className="control">
                      <input
                        className="input is-large"
                        type="text"
                        placeholder={il8n.private_spend_key_input_placeholder}
                        id="scanheight"
                      />
                    </div>
                  </label>
                </div>
                <div className="field">
                  <label className="label has-text-white" htmlFor="scanheight">
                    {il8n.private_view_key}
                    <div className="control">
                      <input
                        className="input is-large"
                        type="text"
                        placeholder={il8n.private_view_key_input_placeholder}
                        id="scanheight"
                      />
                    </div>
                  </label>
                </div>
                <div className="field">
                  <label className="label has-text-white" htmlFor="scanheight">
                    {il8n.scan_height}
                    <div className="control">
                      <input
                        className="input is-large"
                        type="text"
                        placeholder={il8n.scan_height_input_placeholder}
                        id="scanheight"
                      />
                    </div>
                  </label>
                </div>
                <div className="buttons">
                  <button type="submit" className="button is-success is-large ">
                    {il8n.import}
                  </button>
                  <button type="reset" className="button is-large is-black">
                    {il8n.clear}
                  </button>
                </div>
              </form>
            </div>
            <div className="footerbar has-background-black" />
          </div>
        )}
      </div>
    );
  }
}
