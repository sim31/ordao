'use client'

import {
  Box,
  Flex,
  Icon,
  Drawer,
  DrawerContent,
  useDisclosure,
  BoxProps,
  FlexProps,
  Menu,
  Portal,
  VStack,
  Container,
} from '@chakra-ui/react'
import { Text } from '../Text.js';
import { Button } from "../Button.js";
import { IconButton } from "../IconButton.js";
import { CloseButton } from '../CloseButton.js';
import copy from 'copy-to-clipboard'
import {
  FiMenu,
} from 'react-icons/fi'
import { IconType } from 'react-icons'
import { ReactNode } from 'react'
import { config } from '../../global/config';
import { Link as RouterLink, useMatches, useRouter } from '@tanstack/react-router';
import { toaster } from '../ui/toaster'
import { isExternalLink, MenuItem } from '../../global/menuItems'


interface NavItemProps extends FlexProps {
  icon: IconType
  children: ReactNode
  to: string
  newTab?: boolean
  selected?: boolean
}

interface HeaderProps extends FlexProps {
  onMenuOpen: () => void,
  accountInfo?: AccountInfo
  onLogin: () => void
  onLogout: () => void
}

export type MenuSelectHandler = (id: string) => void;

interface SidebarProps extends BoxProps {
  onClose: () => void
  menuItems: MenuItem[]
  onMenuSelect: MenuSelectHandler
}

// const removeTrailingBracesRegex = /\{\s*\}$/;

const SidebarContent = ({
  onClose,
  menuItems,
  onMenuSelect,
  ...rest
}: SidebarProps) => {
  const matches = useMatches()
  const activeMenuItem = menuItems.find((item) => {
    const m = matches.find(match => match.routeId === item.id);
    return m !== undefined;
  })
  const activeMenuItemId = activeMenuItem?.id;
  const { routesById } = useRouter();

  return (
    <Box
      transition="0.2s ease"
      bg={{ base: 'white', _dark: 'gray.900' }}
      borderRight="1px/*  */"
      borderRightColor={{ base: 'gray.400', _dark: 'gray.700' }}
      boxShadow="md"
      w={{ base: '100vw', lg: 80 }}
      left={0}
      top={0}
      pos="fixed"
      h="full"
      zIndex={200}
      {...rest}
    >
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <RouterLink to="/">
          <Text fontSize="2xl" fontWeight="bold" color="black">
            {config.appTitle}
          </Text>
        </RouterLink>

        <CloseButton display={{ base: 'flex', lg: 'none' }} onClick={onClose} />
      </Flex>
      {menuItems.map((item) => (
        <NavItem
          key={item.id}
          icon={item.icon}
          selected={item.id === activeMenuItemId}
          onClick={() => onMenuSelect(item.id)}
          to={isExternalLink(item) ? item.externalLink : routesById[item.id].path}
          newTab={isExternalLink(item)}
        >
          {item.name}
        </NavItem>
      ))}
    </Box>
  )
}

const NavItem = ({ icon, children, selected, to, newTab, ...rest }: NavItemProps) => {
  return (
    <Box
      asChild
      // href="#"
      style={{ textDecoration: 'none' }}
      _focus={{ boxShadow: 'none' }}
    >
      <RouterLink from="/" to={to} target={newTab ? '_blank' : undefined}>
        <Flex
          align="center"
          p="4"
          mx="4"
          borderRadius="lg"
          role="group"
          cursor="pointer"
          _hover={{bg: 'cyan.400', color: 'white' }}
          color="black"
          fontSize="lg"
          fontWeight={selected ? 'extrabold' : 'normal'}
          {...rest}>
          {icon && (
            <Icon
              mr="4"
              fontSize="16"
              _groupHover={{
                color: 'white',
              }}
              as={icon}
            />
          )}
          {children}
        </Flex>
      </RouterLink>
    </Box>
  )
}

const Header = ({ onMenuOpen, accountInfo, onLogin, onLogout, ...rest }: HeaderProps) => {
  function handleCopy(): void {
    if (accountInfo?.fullName) {
      copy(accountInfo.fullName)
    }
    toaster.create({
      description: 'Copied to clipboard',
      type: 'info'
    })
  }

  return (
    <Box width="100vw" left="0" top="0" height="20" pos="fixed" zIndex={100}>
      <Flex
        ml={{ base: 0, lg: 79 }}
        px={{ base: 4, lg: 4 }}
        height="20"
        alignItems="center"
        bg={{ base: 'white', _dark: 'gray.900' }}
        boxShadow="md"
        borderBottomWidth="1px"
        borderBottomColor={{ base: 'gray.300', _dark: 'gray.700' }}
        justifyContent={{ base: 'space-between', lg: 'flex-end' }}
        {...rest}
      >
        <IconButton
          display={{ base: 'flex', lg: 'none' }} // displayed only on small screens
          onClick={onMenuOpen}
          aria-label="open menu"
        >
          <FiMenu />
        </IconButton>

        <RouterLink to="/">
          <Text
            display={{ base: 'flex', lg: 'none' }} // displayed only on small screens
            fontSize="2xl"
            fontWeight="bold"
            color="black"   
          >
            {config.appTitle}
          </Text>
        </RouterLink>

        {accountInfo
          ? (
            <Menu.Root>
              <Menu.Trigger asChild>
                <Button size="sm">
                  {accountInfo.displayName}
                </Button>
              </Menu.Trigger>
              <Portal>
                <Menu.Positioner>
                  <Menu.Content>
                    <Menu.Item fontSize="lg" value="copy" onClick={handleCopy}>
                      Copy
                    </Menu.Item>
                    <Menu.Item fontSize="lg" value="logout" onClick={onLogout}>Logout</Menu.Item>
                  </Menu.Content>
                </Menu.Positioner>
              </Portal>

            </Menu.Root>
          )
          : (
            <Button fontSize="lg" onClick={onLogin} color="black">Login</Button>
          )
        }
      </Flex>
    </Box>
  )
}

export interface AccountInfo {
  displayName: string,
  fullName: string
}

export interface SidebarWithHeaderProps {
  children: ReactNode,
  menuItems: MenuItem[],
  accountInfo?: AccountInfo,
  onLogin: () => void
  onLogout: () => void
}

const SidebarWithHeader = ({
  children,
  menuItems,
  accountInfo,
  onLogin,
  onLogout
}: SidebarWithHeaderProps) => {
  const { open: drawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose } = useDisclosure()
  
  const onMenuSelect = () => {
    if (drawerOpen) {
      onDrawerClose()
    }
  }

  return (
    <Container minHeight="100vh" fluid padding="0" bg={{ base: 'gray.100', _dark: 'gray.900' }}>
      {/* Sidebar displayed on larger screens. Contains title displayed on larger screens */}
      <SidebarContent
        onClose={onDrawerClose}
        display={{ base: 'none', lg: 'block' }}
        menuItems={menuItems}
        onMenuSelect={onMenuSelect}
      />
      {/* Sidebar menu displayed as a drawer on smaller screens */}
      <Drawer.Root
        open={drawerOpen}
        placement="start"
        size="full">
        <DrawerContent>
          <SidebarContent 
            onClose={onDrawerClose} 
            menuItems={menuItems} 
            onMenuSelect={onMenuSelect}
          />
        </DrawerContent>
      </Drawer.Root>
      {/* Header which adjusts to screen size and manages a drawer */}
      <VStack>
        <Header onMenuOpen={onDrawerOpen} onLogin={onLogin} onLogout={onLogout} accountInfo={accountInfo} />

        <Container fluid pl={{ base: 0, lg: 80 }} pt={20} pr="0" margin="0">
          {children}
        </Container>

      </VStack>
    </Container>
  )
}

export default SidebarWithHeader
