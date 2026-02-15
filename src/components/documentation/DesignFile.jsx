import React from 'react';
import FalconComponentCard from 'components/common/FalconComponentCard';
import PageHeader from 'components/common/PageHeader';
import { Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import config from 'config';

const DesignFile = () => (
  <>
    <PageHeader title="Design File" className="mb-3">
      <p className="mt-2 mb-0">
        We have designed Falcon initially directly with code. After receiving
        multiple requests from our customers for design files, we recreated the
        design in Figma.
      </p>
    </PageHeader>

    <FalconComponentCard>
      <FalconComponentCard.Body>
        <Alert variant="info" className="p-3 mb-4">
          <div className="d-flex">
            <FontAwesomeIcon icon={faExclamationCircle} className="fs-6" />
            <div className='flex-1 ms-3'>
              <p className="mb-0">
                Figma file is only available for{' '}
                <strong>Standard Plus</strong> &amp;{' '}
                <strong>Extended Plus</strong> license
              </p>
            </div>
          </div>
        </Alert>
        <h5>To play with the design:</h5>
        <ul>
          <li>
            <a href="https://www.figma.com/" target="_blank" rel="noreferrer">
              Download Figma
            </a>
          </li>
          <li>
            Download{' '}
            <code>
              Falcon-React-design-
              {config.version}.zip
            </code>{' '}
            from ThemeWagon account
          </li>
          <li>
            Open the figma link from{' '}
            <code>
              Falcon-React-design-
              {config.version} {'->'} Figma file link.md
            </code>{' '}
            file
          </li>
          <li>
            The file is "read-only", so you'll have to duplicate it! Go to your
            grid of documents in Figma, click the ellipsis icon on{' '}
            <b className="text-primary text-600">Falcon (Distributed)</b>, and
            then "Duplicate" to create an editable version.
          </li>
        </ul>
      </FalconComponentCard.Body>
    </FalconComponentCard>
  </>
);

export default DesignFile;
