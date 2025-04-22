import {
  Box,
  Flex,
  Button,
  Menu,
  Portal,
  Stack,
} from '@chakra-ui/react'
import copy from 'copy-to-clipboard'
import { useCallback, useState } from 'react'
import { formatEthAddress } from 'eth-address'

// TODO: How to use toaster in V3
// TODO: How to use tooltip in V3
export type AppBarProps = {
  // onNewPropClick: () => void;
  title: string,
  loggedInUser?: string,
  onLogout: () => void,
  onLogin: () => void
}

export const AppBar = (props: AppBarProps) => {
  const { title, loggedInUser, onLogout, onLogin } = props

  const [showMenu, setShowMenu] = useState(false)
  const onCopy = useCallback(() => {
    if (loggedInUser) {
      copy(loggedInUser)
    }
  }, [loggedInUser])

  return (
    // TODO: Work with themes properly instead of setting colors here
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      zIndex="1"
      w="full"
      h="55px"
      bg="black"
      color="white"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <Flex alignItems="center" justifyContent="space-between" w="full" ml="1em" mr="1em">
        <Box fontSize="lg" fontWeight="bold">
          {title}
        </Box>
        <Stack direction="row" gap={4}>
          {loggedInUser ? (
            <Menu.Root>
              <Menu.Trigger asChild>
                <Button variant="outline" size="sm" onClick={() => setShowMenu(!showMenu)}>
                  {formatEthAddress(loggedInUser, 4)}
                </Button>
              </Menu.Trigger>
              <Portal>
                <Menu.Positioner>
                  <Menu.Content>
                    <Menu.Item value="logout" onClick={onLogout}>Logout</Menu.Item>
                    <Menu.Item value="copy" onClick={onCopy}>Copy</Menu.Item>
                  </Menu.Content>
                </Menu.Positioner>
              </Portal>

            </Menu.Root>
            
          ) : (
            <Button onClick={onLogin} backgroundColor="black" color="white">
              Login
            </Button>
          )}
        </Stack>
      </Flex>
    </Box>
  )
}


