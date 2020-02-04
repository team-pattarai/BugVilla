import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useSelector } from 'react-redux';
import { ErrorMessage } from 'react-hook-form';
import { MentionsInput, Mention } from 'react-mentions';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

import useFetch from 'hooks/useFetch';
import Flex from 'components/common/Flex';
import Avatar from 'components/Avatar/Avatar';
import { InputWrapper } from 'components/common/Form/Input';

import CodeBlock from './CodeBlock';
import MentionPlugin from './MentionPlugin';
import { StyledMentionList } from './Editor.style';
import { StoreState } from 'store';

const MarkdownPlugins = {
  code: CodeBlock,
  text: MentionPlugin
};

interface EditorProps {
  markdown: string;
  inputRef?: any;
  errors?: any;
  handleMarkdown?: (e: any) => void;
}

const useSuggestion = (url: string, prop: string[]) => {
  const { data: suggestions } = useFetch(url);
  const [data, setData] = useState([]);

  useEffect(() => {
    if (suggestions) {
      const isBug = prop[1] === 'bugId';
      const users = suggestions.data.map((suggestions: any) => {
        let display = suggestions[prop[0]];
        if (isBug) {
          // if it's a bug then append the #1 (bugId) to the display
          display = suggestions[prop[0]] + ' #' + suggestions[prop[1]];
        }
        return { display, id: suggestions[prop[1]] };
      });
      setData(users);
    }
  }, [suggestions]);

  return data;
};

const Editor: React.FC<EditorProps> = ({
  markdown,
  inputRef,
  errors,
  handleMarkdown
}) => {
  const user = useSelector((state: StoreState) => state.auth.user);

  // fetch mention suggestions
  const allUsers = useSuggestion('/api/user', ['username', 'username']);
  const allBugs = useSuggestion('/api/bugs/suggestions', ['title', 'bugId']);

  return (
    <>
      <Tabs forceRenderTabPanel={true}>
        <Flex className="editor__header" align="center">
          <Avatar
            width="45px"
            height="45px"
            size={45}
            username={user.username}
          />
          <TabList>
            <Tab>Write</Tab>
            <Tab>Preview</Tab>
          </TabList>
        </Flex>
        <TabPanel>
          <InputWrapper>
            <StyledMentionList>
              <MentionsInput
                name="body"
                placeholder="Write Markdown"
                className="editor__tabpanel"
                inputRef={inputRef({ required: 'Body is required' })}
                value={markdown}
                onChange={handleMarkdown}
              >
                <Mention
                  className="mentions__item"
                  trigger="@"
                  displayTransform={(id: any) => `@${id} `}
                  data={allUsers}
                />
                <Mention
                  markup="{{__id__}} Yeah"
                  className="mentions__item"
                  trigger="#"
                  displayTransform={(id: any) => `#${id} `}
                  data={allBugs}
                />
              </MentionsInput>
            </StyledMentionList>
          </InputWrapper>
        </TabPanel>
        <TabPanel>
          <ReactMarkdown
            className="editor__tabpanel markdown-preview"
            source={markdown}
            renderers={MarkdownPlugins}
          />
        </TabPanel>
      </Tabs>
      {/* textarea error */}
      {errors && (
        <div
          className={`text--error ${errors['body'] && 'show-error'}`}
          style={{ marginLeft: 0 }}
        >
          <ErrorMessage errors={errors} name={'body'} />
        </div>
      )}
    </>
  );
};

export default Editor;
